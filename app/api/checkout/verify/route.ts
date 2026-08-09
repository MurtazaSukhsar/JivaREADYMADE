import { NextRequest, NextResponse } from "next/server";
import { getOrderById, markOrderPaid } from "@/lib/orders";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { verifyPaymentSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isTrustedOrigin } from "@/lib/origin-check";

// Called by the browser the moment Razorpay reports a successful payment.
//
// The order already exists in the sheet with status "created" — it's written
// when the cart is priced, so it survives the customer being served by a
// different serverless instance. This route's job is to check the signature
// and flip that existing row to "paid", never to create a second one.
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

  const order = await getOrderById(localOrderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Already settled — the webhook usually beats the browser here. Say yes
  // rather than re-verifying, so a slow redirect doesn't look like a failure.
  if (order.status === "paid") {
    return NextResponse.json({ ok: true, orderId: order.id });
  }

  // The Razorpay order id must be the one we recorded for THIS order, or a
  // valid signature from some other payment could be replayed to mark this
  // one paid.
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

  const paid = await markOrderPaid(razorpay_order_id, razorpay_payment_id);
  if (!paid) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, orderId: paid.id });
}
