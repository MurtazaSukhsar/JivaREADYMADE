import { NextRequest, NextResponse } from "next/server";
import { getOrderById, markOrderPaid, markOrderCodPending } from "@/lib/orders";
import {
  findSuccessfulPayment,
  getCashfreeOrder,
  getCashfreeOrderKind,
  getCashfreePayments,
  isCashfreeOrderPaid,
} from "@/lib/cashfree";
import { verifyCashfreeSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isTrustedOrigin } from "@/lib/origin-check";

// Called by the browser once the Cashfree modal closes.
//
// Note what this route does NOT do: it doesn't believe the browser. The SDK
// hands the page a result object, but that object lives in the customer's
// browser and anything sent from there can be forged. So the only thing the
// client supplies is our own order id — the answer to "was this paid?" is
// fetched from Cashfree directly, server to server.
//
// The order already exists in the sheet with status "created" (written when
// the cart was priced), so this flips an existing row rather than creating
// a second one.
export async function POST(req: NextRequest) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const ip = getClientIp(req);
  const { allowed } = rateLimit(`verify-cf:${ip}`, { limit: 30, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = verifyCashfreeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { localOrderId } = parsed.data;

  const order = await getOrderById(localOrderId);
  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  // Already settled — the webhook usually beats the browser here. Say yes
  // rather than re-checking, so a slow modal doesn't look like a failure.
  if (order.status === "paid" || order.status === "cod_pending") {
    return NextResponse.json({ ok: true, orderId: order.id });
  }

  let cashfreeOrder;
  try {
    cashfreeOrder = await getCashfreeOrder(order.razorpayOrderId);
  } catch (err) {
    console.error("Could not read the Cashfree order:", err);
    return NextResponse.json(
      { error: "Could not confirm the payment. If money left your account, contact us — we have your order." },
      { status: 502 }
    );
  }

  if (!isCashfreeOrderPaid(cashfreeOrder)) {
    // ACTIVE means the customer closed the modal without finishing; EXPIRED
    // and TERMINATED speak for themselves. None of them are a charge.
    return NextResponse.json(
      { error: "Payment wasn't completed. Nothing was charged — you can try again." },
      { status: 402 }
    );
  }

  // The order is paid; fetch the payment id purely so the shop has a
  // reference to match against the Cashfree settlement report. A missing id
  // must not block the order — the money is already in.
  let paymentId = cashfreeOrder?.cf_order_id ?? "";
  try {
    const payment = findSuccessfulPayment(await getCashfreePayments(order.razorpayOrderId));
    if (payment) paymentId = String(payment.cf_payment_id);
  } catch (err) {
    console.error("Could not read Cashfree payments (order is still paid):", err);
  }

  // A COD advance is not a paid order — the balance is still owed at the
  // door. Which one this was comes from the tag Cashfree stored at creation
  // time, never from the request body; falling back to comparing what was
  // charged against what the order is worth for anything created before the
  // tag existed.
  const kind =
    getCashfreeOrderKind(cashfreeOrder) ??
    ((cashfreeOrder?.order_amount ?? 0) < order.amount ? "cod_advance" : "full");

  const settled =
    kind === "cod_advance"
      ? await markOrderCodPending(order.razorpayOrderId, paymentId)
      : await markOrderPaid(order.razorpayOrderId, paymentId);

  if (!settled) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true, orderId: settled.id });
}
