import { NextRequest, NextResponse } from "next/server";
import { getOrderById, markOrderCodPending } from "@/lib/orders";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { verifyPaymentSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isTrustedOrigin } from "@/lib/origin-check";

// The COD advance came through Razorpay. Same shape as /verify, but the
// order lands on "cod_pending" rather than "paid" — the balance is still
// owed at the door.
export async function POST(req: NextRequest) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const ip = getClientIp(req);
  const { allowed } = rateLimit(`verify-cod:${ip}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = verifyPaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { localOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

  const order = await getOrderById(localOrderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Idempotent: a retried request for an order that's already confirmed is
  // a success, not an error.
  if (order.status === "cod_pending" || order.status === "paid") {
    return NextResponse.json({ ok: true, orderId: order.id });
  }

  // Bind the signature to this specific order — see the note in /verify.
  if (order.razorpayOrderId !== razorpay_order_id) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const valid = verifyPaymentSignature({
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    signature: razorpay_signature,
  });

  if (!valid) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  const confirmed = await markOrderCodPending(razorpay_order_id, razorpay_payment_id);
  if (!confirmed) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, orderId: confirmed.id });
}
