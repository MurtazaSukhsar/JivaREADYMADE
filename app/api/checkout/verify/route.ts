import { NextRequest, NextResponse } from "next/server";
import { getOrderById, createOrder } from "@/lib/orders";
import { getPendingOrder, removePendingOrder } from "@/lib/pending-orders";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { verifyPaymentSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isTrustedOrigin } from "@/lib/origin-check";

export async function POST(req: NextRequest) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const ip = getClientIp(req);
  const { allowed } = rateLimit(`verify:${ip}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { localOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  let order = await getOrderById(localOrderId);
  if (!order) {
    const pending = getPendingOrder(localOrderId);
    if (!pending || pending.razorpayOrderId !== razorpay_order_id) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    const valid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!valid) {
      return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
    }

    order = await createOrder({
      id: pending.id,
      items: pending.items,
      amount: pending.amount,
      currency: pending.currency,
      customer: pending.customer,
      razorpayOrderId: razorpay_order_id,
      status: "paid",
      razorpayPaymentId: razorpay_payment_id,
    });

    removePendingOrder(localOrderId);
  }

  return NextResponse.json({ ok: true, orderId: order.id });
}
