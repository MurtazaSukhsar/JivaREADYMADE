import { NextRequest, NextResponse } from "next/server";
import { getOrderByRazorpayOrderId, markOrderCodPending, markOrderPaid } from "@/lib/orders";
import { verifyCashfreeWebhookSignature } from "@/lib/cashfree";

// Configure this exact URL in the Cashfree dashboard under
// Developers → Webhooks, subscribed to the payment events. It's also sent as
// `notify_url` on every order we create, so it works without dashboard setup
// as long as NEXT_PUBLIC_SITE_URL is set.
//
// Why this exists alongside /api/checkout/verify-cashfree: the browser can
// vanish between paying and telling us about it — closed tab, dead battery,
// dropped signal — and the money still moved. This fires from Cashfree's
// servers, so it can't be skipped by the customer.
//
// Both paths end in markOrderPaid()/markOrderCodPending(), which are
// idempotent, so either can arrive first, or both.

// The raw body is required for signature verification, so this route must
// stay on the Node runtime where req.text() gives us the exact bytes sent.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-webhook-signature");
  const timestamp = req.headers.get("x-webhook-timestamp");

  if (!signature || !timestamp) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  let valid = false;
  try {
    valid = verifyCashfreeWebhookSignature({ rawBody, signature, timestamp });
  } catch (err) {
    // Only thrown when CASHFREE_SECRET_KEY is missing. Loud, because a
    // silently unverifiable webhook is a silently unfulfilled order.
    console.error("Cannot verify Cashfree webhook:", err);
    return NextResponse.json({ error: "Not configured." }, { status: 500 });
  }

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const type: string = event?.type ?? "";
  const payment = event?.data?.payment;
  const cfOrder = event?.data?.order;

  // Everything else — failures, drops, user cancellations — leaves the order
  // exactly where it is, on "created". Returning 200 stops Cashfree retrying
  // an event we've deliberately ignored.
  const isSuccess =
    type.startsWith("PAYMENT_SUCCESS") && payment?.payment_status === "SUCCESS";

  if (!isSuccess || !cfOrder?.order_id) {
    return NextResponse.json({ ok: true });
  }

  const cashfreeOrderId: string = cfOrder.order_id;
  const paymentId = String(payment?.cf_payment_id ?? "");

  const order = await getOrderByRazorpayOrderId(cashfreeOrderId);
  if (!order) {
    // Not ours, or the sheet write lost a race with a very fast payment.
    // 200 either way: retrying won't conjure the row, and a 4xx here would
    // have Cashfree redelivering this forever.
    console.warn(`Cashfree webhook for unknown order ${cashfreeOrderId}`);
    return NextResponse.json({ ok: true });
  }

  // Same rule as the verify route: a COD advance settles nothing. The tag is
  // Cashfree's own copy of what we set when the order was created; the amount
  // comparison is the fallback for orders created before the tag existed.
  const tag = cfOrder?.order_tags?.kind;
  const isCodAdvance =
    tag === "cod_advance" ||
    (tag !== "full" && Number(cfOrder?.order_amount ?? 0) < order.amount);

  if (isCodAdvance) {
    await markOrderCodPending(cashfreeOrderId, paymentId);
  } else {
    await markOrderPaid(cashfreeOrderId, paymentId);
  }

  return NextResponse.json({ ok: true });
}
