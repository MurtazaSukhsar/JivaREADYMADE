import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getProductBySlug } from "@/lib/products";
import { savePendingOrder } from "@/lib/pending-orders";
import {
  CashfreeError,
  createCashfreeOrder,
  getCashfreeSdkMode,
  getSiteUrl,
} from "@/lib/cashfree";
import { getDeliveryFee } from "@/lib/format";
import { createOrderSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isTrustedOrigin } from "@/lib/origin-check";
import { siteConfig } from "@/lib/config";
import { OrderItem } from "@/lib/types";

// Prepaid checkout through Cashfree — cards, UPI, netbanking, wallets.
// Charges the full amount (goods + delivery); COD's part-payment lives in
// /api/checkout/create-cod-order.
//
// Hands back a payment_session_id for the browser SDK. That id is single-use
// and scoped to this one order, so it is safe to expose; the API keys never
// leave the server.
export async function POST(req: NextRequest) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const ip = getClientIp(req);
  const { allowed } = rateLimit(`checkout-cf:${ip}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart." }, { status: 400 });
  }

  // Prices come from the catalog on disk, never from the browser — this is
  // what stops someone editing the request to pay less.
  const orderItems: OrderItem[] = [];
  for (const line of parsed.data.items) {
    const product = await getProductBySlug(line.slug);
    if (!product) {
      return NextResponse.json(
        { error: `"${line.slug}" is no longer available.` },
        { status: 400 }
      );
    }
    orderItems.push({
      slug: product.slug,
      name: product.name,
      price: product.price,
      quantity: line.quantity,
      size: line.size,
      color: line.color,
    });
  }

  const customer = parsed.data.customer;

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (subtotal <= 0) {
    return NextResponse.json({ error: "Cart total must be greater than zero." }, { status: 400 });
  }

  const totalQty = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = getDeliveryFee(totalQty);
  const amount = subtotal + deliveryFee;

  const localOrderId = crypto.randomUUID();
  const siteUrl = getSiteUrl();

  let cashfreeOrder;
  try {
    cashfreeOrder = await createCashfreeOrder({
      // Same id on both sides: no mapping table, and the webhook's order_id
      // is directly usable to find our row.
      orderId: localOrderId,
      amount,
      currency: siteConfig.currency,
      customer: {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      },
      note: `${siteConfig.name} order`,
      notifyUrl: siteUrl ? `${siteUrl}/api/webhooks/cashfree` : undefined,
      // Read back by /verify-cashfree and the webhook to tell a full payment
      // apart from a COD advance. Neither trusts the browser for this.
      tags: { kind: "full" },
    });
  } catch (err) {
    console.error("Cashfree error:", err);
    const message =
      err instanceof CashfreeError
        ? err.message
        : "Online payment isn't available right now. Please try UPI or Cash on Delivery.";
    // 400 for "your phone number is wrong" (the customer can fix it), 502 for
    // "our gateway is unhappy" (they can't).
    const status = err instanceof CashfreeError && err.status === 400 ? 400 : 502;
    return NextResponse.json({ error: message }, { status });
  }

  // Written before the customer starts paying so the order exists no matter
  // which serverless instance handles the callback (see lib/pending-orders.ts).
  try {
    const now = new Date().toISOString();
    await savePendingOrder({
      id: localOrderId,
      items: orderItems,
      amount,
      currency: siteConfig.currency,
      status: "created",
      customer,
      // Column M in the Orders sheet — the gateway's id for this order.
      razorpayOrderId: cashfreeOrder.order_id,
      shipped: false,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    console.error("Could not write the pending Cashfree order:", err);
    return NextResponse.json(
      { error: "Could not save your order. Nothing was charged — please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    localOrderId,
    paymentSessionId: cashfreeOrder.payment_session_id,
    // The SDK must be told which environment the session belongs to.
    mode: getCashfreeSdkMode(),
    amount,
    currency: siteConfig.currency,
  });
}
