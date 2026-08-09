import "server-only";
import crypto from "crypto";
import { Customer, Order, OrderItem } from "./types";
import { isLanguage } from "./i18n";
import { appendSheetRow, readSheetRows, updateSheetRow } from "./google-sheets";

// Orders live in the same Google Sheet as the products, on a tab named
// exactly "Orders". The sheet is the source of truth: it survives redeploys,
// the shop owner can read and edit it directly, and there's no database to
// run.
//
// Sheet layout — header row, data from row 2 down:
//   A  Order ID          I  Pincode
//   B  Date              J  Items
//   C  Status            K  Amount
//   D  Customer Name     L  Currency
//   E  Phone             M  Razorpay Order ID
//   F  Email             N  Payment ID
//   G  Address           O  Shipped
//   H  City              P  Shipped At
//                        Q  Items JSON
//                        R  Language
//
// Column J is a human-readable summary for whoever is packing the parcel;
// column Q is the same items as JSON so the app can rebuild them losslessly.
// Keep both — J is for people, Q is for code.
//
// Concurrency note: marking an order paid or shipped is read-then-write, so
// two writes to the *same* order in the same second could clobber each other.
// In practice each order is touched by one webhook and one human, seconds
// apart, so this is fine at shop scale. Appends (new orders) are handled
// server-side by Sheets and don't race.

const SHEET_TAB = "Orders";
const RANGE_READ = `${SHEET_TAB}!A2:S`;
const RANGE_APPEND = `${SHEET_TAB}!A:S`;
const COLUMN_COUNT = 19; // A..S

function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("GOOGLE_SHEET_ID is not set — see .env.example.");
  return id;
}

function itemsSummary(items: OrderItem[]): string {
  return items
    .map((i) => {
      const variant = [i.size, i.color].filter(Boolean).join(" / ");
      return `${i.name} x${i.quantity}${variant ? ` (${variant})` : ""}`;
    })
    .join("; ");
}

function toRow(order: Order): (string | number)[] {
  return [
    order.id,
    order.createdAt,
    order.status,
    order.customer.name,
    order.customer.phone,
    order.customer.email,
    order.customer.address,
    order.customer.city,
    order.customer.pincode,
    itemsSummary(order.items),
    order.amount,
    order.currency,
    order.razorpayOrderId,
    order.razorpayPaymentId ?? "",
    order.shipped ? "yes" : "no",
    order.shippedAt ?? "",
    JSON.stringify(order.items),
    order.customer.language,
    order.customer.state,
  ];
}

function cell(row: string[], i: number): string {
  return String(row[i] ?? "").trim();
}

function parseRow(row: string[], rowNumber: number): Order | null {
  const id = cell(row, 0);
  if (!id) return null;

  let items: OrderItem[] = [];
  const rawItems = cell(row, 16);
  if (rawItems) {
    try {
      const parsed = JSON.parse(rawItems);
      if (Array.isArray(parsed)) items = parsed as OrderItem[];
    } catch {
      // A hand-edited or truncated JSON cell shouldn't hide the whole order
      // from the admin panel — fall back to no line items.
      items = [];
    }
  }

  const statusRaw = cell(row, 2).toLowerCase();
  const status: Order["status"] =
    statusRaw === "paid" ||
    statusRaw === "failed" ||
    statusRaw === "cod_pending" ||
    statusRaw === "upi_pending"
      ? statusRaw
      : "created";

  const shippedRaw = cell(row, 14).toLowerCase();
  const languageRaw = cell(row, 17).toLowerCase();

  return {
    id,
    createdAt: cell(row, 1),
    updatedAt: cell(row, 1),
    status,
    customer: {
      name: cell(row, 3),
      phone: cell(row, 4),
      email: cell(row, 5),
      address: cell(row, 6),
      city: cell(row, 7),
      pincode: cell(row, 8),
      // Orders placed before the Language column existed have a blank cell.
      language: isLanguage(languageRaw) ? languageRaw : "en",
      state: cell(row, 18),
    },
    items,
    amount: Number(row[10]) || 0,
    currency: cell(row, 11),
    razorpayOrderId: cell(row, 12),
    razorpayPaymentId: cell(row, 13) || undefined,
    shipped: shippedRaw === "yes" || shippedRaw === "true",
    shippedAt: cell(row, 15) || undefined,
    rowNumber,
  };
}

async function readAll(): Promise<Order[]> {
  const rows = await readSheetRows(getSheetId(), RANGE_READ);
  const orders: Order[] = [];
  rows.forEach((row, i) => {
    const order = parseRow(row, i + 2); // row 1 is the header
    if (order) orders.push(order);
  });
  return orders;
}

async function writeRow(order: Order): Promise<void> {
  if (!order.rowNumber) {
    throw new Error(`Order ${order.id} has no sheet row to update.`);
  }
  await updateSheetRow(
    getSheetId(),
    `${SHEET_TAB}!A${order.rowNumber}:S${order.rowNumber}`,
    toRow(order)
  );
}

export async function createOrder(input: {
  id?: string;
  items: OrderItem[];
  amount: number;
  currency: string;
  customer: Customer;
  razorpayOrderId: string;
  status?: Order["status"];
  razorpayPaymentId?: string;
}): Promise<Order> {
  const now = new Date().toISOString();

  const order: Order = {
    id: input.id ?? crypto.randomUUID(),
    items: input.items,
    amount: input.amount,
    currency: input.currency,
    status: input.status ?? "created",
    customer: input.customer,
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
    shipped: false,
    createdAt: now,
    updatedAt: now,
  };

  // RAW so Sheets stores the phone and pincode exactly as typed instead of
  // reading "+919876543210" as a formula or eating a leading zero.
  await appendSheetRow(getSheetId(), RANGE_APPEND, toRow(order), "RAW");
  return order;
}

/**
 * Overwrites an existing order's row. Used by the pending-order layer to
 * update an order in place rather than appending a second row for it.
 */
export async function updateOrderRow(order: Order): Promise<void> {
  await writeRow(order);
}

export async function getAllOrders(): Promise<Order[]> {
  const orders = await readAll();
  return orders.reverse(); // newest first
}

export async function getOrderById(id: string): Promise<Order | null> {
  const orders = await readAll();
  return orders.find((o) => o.id === id) ?? null;
}

export async function getOrderByRazorpayOrderId(
  razorpayOrderId: string
): Promise<Order | null> {
  const orders = await readAll();
  return orders.find((o) => o.razorpayOrderId === razorpayOrderId) ?? null;
}

// Idempotent: calling this twice for an already-paid order is a safe no-op.
// Both the client-side verification and the Razorpay webhook call it, and
// either one (or both, in either order) can arrive first.
export async function markOrderPaid(
  razorpayOrderId: string,
  paymentId: string
): Promise<Order | null> {
  const order = await getOrderByRazorpayOrderId(razorpayOrderId);
  if (!order) return null;
  if (order.status === "paid") return order;

  order.status = "paid";
  order.razorpayPaymentId = paymentId;
  order.updatedAt = new Date().toISOString();
  await writeRow(order);
  return order;
}

export async function markOrderCodPending(
  razorpayOrderId: string,
  paymentId: string
): Promise<Order | null> {
  const order = await getOrderByRazorpayOrderId(razorpayOrderId);
  if (!order) return null;
  if (order.status === "cod_pending") return order;

  order.status = "cod_pending";
  order.razorpayPaymentId = paymentId;
  order.updatedAt = new Date().toISOString();
  await writeRow(order);
  return order;
}

/**
 * The customer scanned the UPI QR and submitted their reference number.
 * Nothing has been checked against the bank yet — this only records the
 * claim so it shows up in the admin panel for someone to verify.
 */
export async function markOrderUpiPending(
  orderId: string,
  upiRef: string
): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;
  // Already settled by hand? Don't drag a paid order backwards because
  // someone reloaded the confirmation page.
  if (order.status === "paid") return order;

  order.status = "upi_pending";
  order.razorpayPaymentId = upiRef;
  order.updatedAt = new Date().toISOString();
  await writeRow(order);
  return order;
}

/**
 * Admin confirming, by eye, that a UPI payment actually landed. Separate
 * from markOrderPaid() because there's no Razorpay order id to look up —
 * the human is the verification step here.
 */
export async function markOrderPaidById(orderId: string): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;
  if (order.status === "paid") return order;

  order.status = "paid";
  order.updatedAt = new Date().toISOString();
  await writeRow(order);
  return order;
}

export async function setOrderShipped(
  orderId: string,
  shipped: boolean
): Promise<Order | null> {
  const order = await getOrderById(orderId);
  if (!order) return null;

  order.shipped = shipped;
  order.shippedAt = shipped ? new Date().toISOString() : undefined;
  order.updatedAt = new Date().toISOString();
  await writeRow(order);
  return order;
}

export const ORDERS_SHEET_COLUMN_COUNT = COLUMN_COUNT;
