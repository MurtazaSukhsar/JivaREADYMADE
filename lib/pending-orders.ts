import "server-only";
import { Order } from "./types";
import { createOrder, getOrderById, updateOrderRow } from "./orders";

// A "pending" order is one that's been priced and recorded but not paid for
// yet — the customer is somewhere between pressing Pay and the money
// arriving.
//
// This used to be a JSON file on disk (data/pending-orders.json). That works
// on a laptop and fails completely on Vercel, for two separate reasons:
//
//   1. The filesystem is read-only outside /tmp, so the write silently did
//      nothing (the error was caught and logged, so it looked fine).
//   2. Even with a writable disk, each request can be served by a different
//      instance. The function that created the order and the page that reads
//      it back are not the same machine and share nothing.
//
// The symptom was a 404 on /pay/[id] immediately after checkout in
// production, while everything worked locally.
//
// So pending orders now live in the Orders sheet with status "created", the
// same place finished orders go. The sheet is reachable from every instance,
// survives redeploys, and is already the source of truth for this shop.
//
// The visible trade-off: abandoned checkouts leave "created" rows in the
// sheet. That's normal — they're abandoned carts, the admin panel counts
// only paid orders, and having a record of people who nearly bought
// something is worth more than a tidy sheet.

/**
 * Fetches an order that hasn't been paid for yet.
 *
 * Returns null for an order that's already `paid`/`upi_pending`/`cod_pending`
 * so a caller can't accidentally treat a completed order as fresh and take
 * payment for it twice.
 */
export async function getPendingOrder(id: string): Promise<Order | null> {
  const order = await getOrderById(id);
  if (!order) return null;
  return order.status === "created" ? order : null;
}

/**
 * Writes a pending order. Upserts: appends on first call, updates the same
 * row afterwards. Reloading the payment page must not litter the sheet with
 * duplicates of one order.
 */
export async function savePendingOrder(order: Order): Promise<void> {
  const existing = await getOrderById(order.id);
  if (existing?.rowNumber) {
    await updateOrderRow({ ...order, rowNumber: existing.rowNumber });
    return;
  }
  await createOrder({
    id: order.id,
    items: order.items,
    amount: order.amount,
    currency: order.currency,
    customer: order.customer,
    razorpayOrderId: order.razorpayOrderId,
    status: "created",
  });
}

/**
 * No-op, kept so the call sites still read sensibly.
 *
 * With the sheet as storage there's nothing to clean up: confirming a
 * payment updates the existing row in place rather than moving the order
 * from one store to another. Deleting the row would throw away the order
 * we just took money for.
 */
export async function removePendingOrder(_id: string): Promise<void> {
  // intentionally empty — see above
}
