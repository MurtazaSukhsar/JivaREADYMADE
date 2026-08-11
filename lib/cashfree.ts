import "server-only";
import crypto from "crypto";

// Cashfree Payment Gateway (PG) — "Orders" API v3.
//
// The flow, end to end:
//
//   1. Server calls createCashfreeOrder() and gets back a payment_session_id.
//   2. Browser hands that session id to the Cashfree JS SDK, which opens the
//      checkout modal. Nothing secret ever reaches the browser — the session
//      id is single-use and tied to one order.
//   3. When the modal closes, the browser pings our /verify route, which asks
//      Cashfree what actually happened (getCashfreeOrder). We never trust the
//      SDK's own success callback: it lives in the customer's browser.
//   4. Separately, Cashfree's webhook fires from their servers, so a closed
//      tab or dropped connection can't lose a payment.
//
// Steps 3 and 4 both end in markOrderPaid(), which is idempotent — either can
// arrive first, or both.
//
// No SDK dependency here on purpose: this is four REST calls, and the
// official Node package pulls in a large axios-based client we'd otherwise
// have no use for.

export type CashfreeEnv = "sandbox" | "production";

const SANDBOX_BASE = "https://sandbox.cashfree.com/pg";
const PRODUCTION_BASE = "https://api.cashfree.com/pg";

// Cashfree pins behaviour to a dated API version rather than a path segment.
// Overridable so a future version bump doesn't need a code change.
const DEFAULT_API_VERSION = "2025-01-01";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env.local — see .env.example. ` +
        `Get your keys from the Cashfree dashboard under Developers → API Keys.`
    );
  }
  return value;
}

/**
 * "production" only when explicitly asked for. Defaulting the other way
 * would mean a missing env var silently takes real money in test.
 */
export function getCashfreeEnv(): CashfreeEnv {
  return process.env.CASHFREE_ENV?.toLowerCase() === "production"
    ? "production"
    : "sandbox";
}

export function getCashfreeBaseUrl(): string {
  return getCashfreeEnv() === "production" ? PRODUCTION_BASE : SANDBOX_BASE;
}

/**
 * The `mode` string the browser SDK expects. Must match the environment the
 * payment_session_id was minted in, or the modal rejects it.
 */
export function getCashfreeSdkMode(): CashfreeEnv {
  return getCashfreeEnv();
}

function authHeaders(): Record<string, string> {
  return {
    "x-client-id": requireEnv("CASHFREE_APP_ID"),
    "x-client-secret": requireEnv("CASHFREE_SECRET_KEY"),
    "x-api-version": process.env.CASHFREE_API_VERSION || DEFAULT_API_VERSION,
    "content-type": "application/json",
  };
}

/** Thrown for anything Cashfree rejects, carrying their message where there is one. */
export class CashfreeError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "CashfreeError";
    this.status = status;
    this.code = code;
  }
}

async function cashfreeFetch(path: string, init?: RequestInit): Promise<any> {
  const res = await fetch(`${getCashfreeBaseUrl()}${path}`, {
    ...init,
    headers: { ...authHeaders(), ...(init?.headers ?? {}) },
    // Payment state must never be served from a cache.
    cache: "no-store",
  });

  const text = await res.text();
  let body: any = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    // Cashfree returns HTML for a few edge cases (bad gateway, WAF blocks).
  }

  if (!res.ok) {
    throw new CashfreeError(
      body?.message || `Cashfree returned ${res.status}.`,
      res.status,
      body?.code
    );
  }

  return body;
}

// ── Field normalisation ──────────────────────────────────────────────────
//
// Cashfree validates customer_details strictly and rejects the whole order
// on a bad field. Our checkout form is deliberately more permissive (a
// customer who can't type their number in the exact expected shape is a lost
// sale), so we reshape here rather than tightening the form.

/**
 * Cashfree wants a bare 10-digit Indian mobile number: no +91, no spaces.
 * Returns null when there aren't 10 usable digits, so the caller can give a
 * specific error instead of surfacing Cashfree's generic one.
 */
export function toCashfreePhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  // "+91 98765 43210" → 12 digits → take the last 10. Same for a leading 0.
  const last10 = digits.length > 10 ? digits.slice(-10) : digits;
  return /^[6-9]\d{9}$/.test(last10) ? last10 : null;
}

/** customer_id must be alphanumeric, 3–50 chars. Our order ids are UUIDs. */
function toCashfreeCustomerId(localOrderId: string): string {
  const alnum = localOrderId.replace(/[^A-Za-z0-9]/g, "");
  return alnum.slice(0, 50) || `cust${Date.now()}`;
}

/** customer_name has a 3-char minimum — omit rather than send a rejected value. */
function toCashfreeName(name: string): string | undefined {
  const clean = name.trim().slice(0, 100);
  return clean.length >= 3 ? clean : undefined;
}

/** Email is optional on our form. Only send something that will pass. */
function toCashfreeEmail(email: string): string | undefined {
  const clean = email.trim().slice(0, 100);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean) ? clean : undefined;
}

// ── Orders ───────────────────────────────────────────────────────────────

export type CreateCashfreeOrderInput = {
  /** Our own order id. Reused verbatim as Cashfree's order_id so lookups need no mapping table. */
  orderId: string;
  /** Rupees, not paise — Cashfree takes major units with up to 2 decimals. */
  amount: number;
  currency: string;
  customer: { name: string; email: string; phone: string };
  /** 3–200 chars, shown in the dashboard. */
  note?: string;
  /** Server-to-server callback. Skipped when the site URL isn't known (e.g. local dev). */
  notifyUrl?: string;
  /**
   * Free-form key/value pairs echoed back on the order and in every webhook.
   * We put `kind` here ("full" or "cod_advance") because the webhook payload
   * alone can't tell a full payment from a COD part-payment.
   */
  tags?: Record<string, string>;
};

export type CashfreeOrder = {
  cf_order_id: string;
  order_id: string;
  order_status: string;
  order_amount: number;
  payment_session_id: string;
  order_tags?: Record<string, string> | null;
};

/** Which of our two flows a Cashfree order belongs to. */
export type CashfreeOrderKind = "full" | "cod_advance";

export async function createCashfreeOrder(
  input: CreateCashfreeOrderInput
): Promise<CashfreeOrder> {
  const phone = toCashfreePhone(input.customer.phone);
  if (!phone) {
    throw new CashfreeError(
      "Enter a valid 10-digit Indian mobile number to pay online.",
      400,
      "invalid_phone"
    );
  }

  const body: Record<string, unknown> = {
    order_id: input.orderId,
    // Two decimals: Cashfree rejects anything longer, and floating-point
    // arithmetic upstream can produce 123.45000000000002.
    order_amount: Number(input.amount.toFixed(2)),
    order_currency: input.currency,
    customer_details: {
      customer_id: toCashfreeCustomerId(input.orderId),
      customer_phone: phone,
      customer_name: toCashfreeName(input.customer.name),
      customer_email: toCashfreeEmail(input.customer.email),
    },
    order_note: input.note,
    order_tags: input.tags,
  };

  // return_url is deliberately absent: the checkout runs in a modal on our
  // own page, so there is nothing to redirect back to. notify_url is what
  // makes the payment survive the customer closing the tab.
  if (input.notifyUrl) {
    body.order_meta = { notify_url: input.notifyUrl };
  }

  const order = await cashfreeFetch("/orders", {
    method: "POST",
    body: JSON.stringify(body),
    // Safe to retry the exact same order without double-charging.
    headers: { "x-idempotency-key": input.orderId },
  });

  if (!order?.payment_session_id) {
    throw new CashfreeError("Cashfree did not return a payment session.", 502);
  }

  return order as CashfreeOrder;
}

export async function getCashfreeOrder(orderId: string): Promise<CashfreeOrder | null> {
  try {
    return (await cashfreeFetch(`/orders/${encodeURIComponent(orderId)}`)) as CashfreeOrder;
  } catch (err) {
    if (err instanceof CashfreeError && err.status === 404) return null;
    throw err;
  }
}

export type CashfreePayment = {
  cf_payment_id: string | number;
  payment_status: string;
  payment_amount: number;
  payment_method?: unknown;
};

/**
 * Every payment attempt against an order, newest last. Used to pull the
 * payment id for the successful attempt so it can be written to the sheet
 * for reconciliation.
 */
export async function getCashfreePayments(orderId: string): Promise<CashfreePayment[]> {
  try {
    const payments = await cashfreeFetch(
      `/orders/${encodeURIComponent(orderId)}/payments`
    );
    return Array.isArray(payments) ? (payments as CashfreePayment[]) : [];
  } catch (err) {
    if (err instanceof CashfreeError && err.status === 404) return [];
    throw err;
  }
}

/**
 * The single question that matters: did the money arrive?
 *
 * "PAID" is Cashfree's terminal success state for an order. Anything else —
 * ACTIVE (still open), EXPIRED, TERMINATED — is not paid, and a partially
 * paid order is not paid either.
 */
export function isCashfreeOrderPaid(order: CashfreeOrder | null): boolean {
  return order?.order_status === "PAID";
}

/**
 * Reads back the `kind` tag we set at creation time.
 *
 * This is asked of Cashfree, not of the browser, on purpose: it decides
 * whether a payment settles the order or is only the COD advance, so letting
 * the client choose would let someone pay ₹100 and have the order marked
 * fully paid. Returns null when the tag is absent (orders created before this
 * existed), so the caller can fall back to comparing amounts.
 */
export function getCashfreeOrderKind(order: CashfreeOrder | null): CashfreeOrderKind | null {
  const tag = order?.order_tags?.kind;
  return tag === "cod_advance" || tag === "full" ? tag : null;
}

/** The successful attempt, if there is one. */
export function findSuccessfulPayment(payments: CashfreePayment[]): CashfreePayment | null {
  return payments.find((p) => p.payment_status === "SUCCESS") ?? null;
}

// ── Webhooks ─────────────────────────────────────────────────────────────

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verifies the `x-webhook-signature` header Cashfree sends with every webhook.
 *
 * The signature is base64(HMAC-SHA256(timestamp + rawBody, secretKey)) — note
 * the timestamp is prepended to the body, and `rawBody` must be the exact
 * unparsed request text. Parsing and re-stringifying reorders keys and breaks
 * the check.
 *
 * Signed with CASHFREE_SECRET_KEY, the same secret used for API auth — there
 * is no separate webhook secret to configure.
 */
export function verifyCashfreeWebhookSignature({
  rawBody,
  signature,
  timestamp,
}: {
  rawBody: string;
  signature: string;
  timestamp: string;
}): boolean {
  const secret = requireEnv("CASHFREE_SECRET_KEY");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${timestamp}${rawBody}`)
    .digest("base64");
  return timingSafeEqualStr(expected, signature);
}

/**
 * Absolute URL of this deployment, used to build the webhook callback.
 * Returns null when it can't be determined — the payment still works, it just
 * leans entirely on the browser coming back to /verify.
 */
export function getSiteUrl(): string | null {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  // Set automatically on Vercel.
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return null;
}
