import { NextRequest, NextResponse } from "next/server";
import { getOrderById, createOrder, markOrderUpiPending } from "@/lib/orders";
import { getPendingOrder, removePendingOrder } from "@/lib/pending-orders";
import { confirmUpiSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isTrustedOrigin } from "@/lib/origin-check";

// The customer has paid by UPI QR and typed in the reference number their
// app gave them.
//
// IMPORTANT: this endpoint cannot verify anything. UPI collect-by-QR gives
// the merchant no callback, so all we have is the customer's word plus a
// reference number to search the bank statement with. The order is therefore
// written as `upi_pending`, and the shop owner presses "Mark paid" in the
// admin panel once the money is actually visible in the account.
//
// The amount is *not* taken from this request — it comes off the pending
// order the server priced earlier, so there is nothing here worth forging
// beyond claiming a payment that never happened, which the human check
// catches.
export async function POST(req: NextRequest) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const ip = getClientIp(req);
  const { allowed } = rateLimit(`confirm-upi:${ip}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = confirmUpiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const { localOrderId, upiRef } = parsed.data;

  // Double submit — the order is already on the sheet. Update the reference
  // in place rather than appending a second row for the same payment.
  const existing = await getOrderById(localOrderId);
  if (existing) {
    try {
      await markOrderUpiPending(localOrderId, upiRef);
    } catch (err) {
      console.error("Could not update the UPI reference:", err);
    }
    return NextResponse.json({ ok: true, orderId: existing.id });
  }

  const pending = getPendingOrder(localOrderId);
  if (!pending) {
    return NextResponse.json(
      { error: "This order has expired. Please add your items again." },
      { status: 404 }
    );
  }

  let order;
  try {
    order = await createOrder({
      id: pending.id,
      items: pending.items,
      amount: pending.amount,
      currency: pending.currency,
      customer: pending.customer,
      // The `tr` reference we put in the payment link — it shows up on the
      // customer's bank statement, which is how the owner matches the two.
      razorpayOrderId: pending.razorpayOrderId,
      status: "upi_pending",
      razorpayPaymentId: upiRef,
    });
  } catch (err) {
    console.error("Could not save the UPI order:", err);
    return NextResponse.json(
      { error: "Could not save your order. Please message us on WhatsApp." },
      { status: 502 }
    );
  }

  removePendingOrder(localOrderId);

  return NextResponse.json({ ok: true, orderId: order.id });
}
