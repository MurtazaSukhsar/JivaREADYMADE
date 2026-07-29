import { NextRequest, NextResponse } from "next/server";
import { markOrderPaid } from "@/lib/orders";
import { verifyWebhookSignature } from "@/lib/razorpay";

// Configure this exact URL in the Razorpay dashboard under
// Settings → Webhooks, with the "payment.captured" event enabled, and put
// the webhook secret you set there into RAZORPAY_WEBHOOK_SECRET.
//
// Why this exists alongside /api/checkout/verify: the client-side redirect
// after payment can be lost (closed tab, dropped connection, flaky
// network) even when the payment actually succeeded. Razorpay's webhook
// fires from their servers regardless of what happens in the customer's
// browser, so this is the check that can't be skipped by the customer.
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  if (!signature || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured" || event.event === "order.paid") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id && payment?.id) {
      await markOrderPaid(payment.order_id, payment.id);
    }
  }

  return NextResponse.json({ ok: true });
}
