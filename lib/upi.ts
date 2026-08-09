// Builds UPI payment links with the amount already filled in.
//
// A GPay/PhonePe/Paytm QR code is nothing more than a URL of this shape:
//
//   upi://pay?pa=<your-upi-id>&pn=<your-name>&am=<amount>&cu=INR&tn=<note>&tr=<ref>
//
// The printed QR stuck to a shop counter is a *static* one — it leaves out
// `am`, which is exactly why the customer has to type the amount themselves.
// Everything here builds a *dynamic* link instead: same UPI ID, amount baked
// in per order. Scan it and the payment app opens with the figure already
// there and the field greyed out, so a customer can't underpay by mistyping.
//
// Parameters (NPCI UPI Linking Specification):
//   pa  payee address — your UPI ID / VPA          (required)
//   pn  payee name — shown in the customer's app   (required)
//   am  amount, 2 decimal places                   (what makes this dynamic)
//   cu  currency — INR only, UPI is domestic
//   tn  transaction note — free text, shown in app
//   tr  transaction reference — our order handle, comes back in the
//       customer's statement so it can be matched to an order
//
// NOTE: there is no callback. UPI collect-by-QR has no way to tell the site
// that money arrived, so an order paid this way lands as `upi_pending` and a
// human confirms it. See app/api/checkout/confirm-upi/route.ts.

import { siteConfig } from "./config";

export type UpiLinkOptions = {
  amount: number;
  note: string;
  txnRef: string;
};

/** Reads the UPI ID from the environment, falling back to lib/config.ts. */
export function getUpiConfig(): { vpa: string; payeeName: string } | null {
  const vpa = (process.env.UPI_ID || siteConfig.upi.vpa || "").trim();
  if (!vpa || !isValidVpa(vpa)) return null;
  const payeeName =
    (process.env.UPI_PAYEE_NAME || siteConfig.upi.payeeName || siteConfig.legalName || siteConfig.name).trim();
  return { vpa, payeeName };
}

/**
 * A UPI ID looks like `name@bank` — letters, digits, dot, hyphen and
 * underscore on the left, a handle on the right. Deliberately loose: banks
 * keep inventing new handles and rejecting a valid one is worse than
 * accepting an odd-looking one.
 */
export function isValidVpa(vpa: string): boolean {
  return /^[a-zA-Z0-9._-]{1,64}@[a-zA-Z][a-zA-Z0-9.]{1,30}$/.test(vpa.trim());
}

/**
 * A short, human-quotable reference. Goes out as `tr` and comes back on the
 * customer's bank statement, which makes reconciliation possible even if
 * they never type the UPI ref number into the site.
 *
 * The spec allows A-Z0-9 only, max 35 characters — hence the uppercasing.
 *
 * `attempt` matters more than it looks. Banks and PSPs treat `tr` as the
 * unique id of a *payment attempt*, not of an order, and several reject a
 * reference they've seen before — sometimes behind an unrelated-sounding
 * error. Without a fresh suffix, a customer who scans, fails, and rescans
 * the same QR sends the identical reference every time and can get stuck in
 * a loop that looks like a bank problem.
 *
 * The `JIVA<order>` prefix stays constant, so an order is still findable on
 * a statement by prefix even though each attempt is distinct.
 */
export function makeTxnRef(orderId: string, attempt?: string): string {
  const clean = orderId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const suffix = (attempt ?? "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `JIVA${clean.slice(0, 12)}${suffix}`.slice(0, 35);
}

/** A fresh, compact attempt id. Base36 time — short, and never repeats. */
export function makeAttemptId(): string {
  return Date.now().toString(36).toUpperCase();
}

/** Amount must be a plain decimal with exactly 2 places — no separators. */
function formatAmount(amount: number): string {
  return amount.toFixed(2);
}

/**
 * The generic `upi://` link. On Android this opens the "pay with" chooser
 * listing every UPI app installed; on iOS it opens whichever app claimed the
 * scheme. This is also the string encoded into the QR image.
 */
export function buildUpiLink(opts: UpiLinkOptions): string {
  const config = getUpiConfig();
  if (!config) throw new Error("No UPI ID configured — set UPI_ID or siteConfig.upi.vpa.");
  return `upi://pay?${buildQuery(config, opts)}`;
}

// App-specific URL schemes. Same query string, different prefix — each app
// registers its own scheme so the link skips the chooser and goes straight
// in. If the app isn't installed the link simply does nothing, which is why
// the QR is always shown as a fallback.
//
// `tez://` looks obsolete but is not: it's Google Pay's original Tez scheme,
// it is still what Google documents, and it is confirmed working on a real
// device against this shop. Android `intent://` URLs naming the app package
// are the theoretically more robust alternative — do not swap to them
// without testing on real hardware first. Untested "improvements" in a
// payment path cost sales.
const APP_SCHEMES = {
  gpay: "tez://upi/pay",
  phonepe: "phonepe://pay",
  paytm: "paytmmp://pay",
} as const;

export type UpiApp = keyof typeof APP_SCHEMES;

export function buildAppLinks(opts: UpiLinkOptions): Record<UpiApp | "any", string> {
  const config = getUpiConfig();
  if (!config) throw new Error("No UPI ID configured — set UPI_ID or siteConfig.upi.vpa.");
  const query = buildQuery(config, opts);
  return {
    any: `upi://pay?${query}`,
    gpay: `${APP_SCHEMES.gpay}?${query}`,
    phonepe: `${APP_SCHEMES.phonepe}?${query}`,
    paytm: `${APP_SCHEMES.paytm}?${query}`,
  };
}

/** The shared query string. Identical across every scheme and platform. */
function buildQuery(
  config: { vpa: string; payeeName: string },
  opts: UpiLinkOptions
): string {
  // Built by hand rather than with URLSearchParams, for one reason: that
  // class encodes spaces as "+" (HTML form rules), and UPI apps don't all
  // decode "+" back to a space. The result was payment screens showing
  // "JIVAREADYYMADE+order+7e9761a6". encodeURIComponent uses %20, which
  // every app reads correctly.
  //
  // Only the six parameters below are sent. Nothing exotic:
  //   pa payee VPA · pn payee name · am amount · cu currency
  //   tn note      · tr our reference
  //
  // In particular `mode` and `mc` are NOT set. `mode=04` is the NPCI
  // "QR-initiated" flag and `mc` is a merchant category code — both belong
  // to registered merchant QRs. Sending them from a personal VPA is at best
  // meaningless and at worst grounds for a bank to reject the payment, which
  // is exactly the failure we were chasing. Keep this link boring.
  const params = [
    ["pa", config.vpa],
    ["pn", config.payeeName],
    ["am", formatAmount(opts.amount)],
    ["cu", "INR"],
    ["tn", opts.note],
    ["tr", opts.txnRef],
  ]
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");
  return params;
}

/**
 * Renders the UPI link as a PNG data URL. Done on the server so the QR
 * library never ships to the browser, and so every customer gets an
 * identical, scannable image regardless of their device.
 *
 * Two things here are deliberate and shouldn't be "tidied up" to match the
 * dark theme:
 *
 *   • Dark modules on a light background, not the other way round. An
 *     inverted QR looks better against this site, but the spec assumes
 *     dark-on-light and a number of Android camera apps simply refuse to
 *     read inverted codes. A QR that fails to scan on someone's phone is a
 *     lost sale. Carbon-on-cream keeps it on-brand *and* standard.
 *   • The margin is the mandatory "quiet zone". Scanners need that blank
 *     border to find the code — don't drop it to save space.
 */
export async function buildUpiQrDataUrl(link: string): Promise<string> {
  const QRCode = (await import("qrcode")).default;
  return QRCode.toDataURL(link, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 512,
    // Matches `cream` / `carbon` in tailwind.config.ts so the code sits
    // flush inside its tile with no seam.
    color: { dark: "#120005", light: "#FFFFFF" },
  });
}
