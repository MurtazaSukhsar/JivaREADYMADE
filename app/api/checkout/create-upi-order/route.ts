import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getProductBySlug } from "@/lib/products";
import { savePendingOrder } from "@/lib/pending-orders";
import { getDeliveryFee } from "@/lib/format";
import { createOrderSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isTrustedOrigin } from "@/lib/origin-check";
import { siteConfig } from "@/lib/config";
import { OrderItem } from "@/lib/types";
import { buildAppLinks, buildUpiQrDataUrl, getUpiConfig, makeTxnRef } from "@/lib/upi";

// Prices the cart and hands back a UPI link with the amount already in it,
// plus the same link as a QR image. No third-party payment SDK, no API keys,
// no merchant account — just the UPI ID from .env and an NPCI-standard link.
//
// Nothing is written to the Orders sheet here: the order waits in
// data/pending-orders.json until the customer confirms (see confirm-upi).
export async function POST(req: NextRequest) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const ip = getClientIp(req);
  const { allowed } = rateLimit(`checkout-upi:${ip}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const upiConfig = getUpiConfig();
  if (!upiConfig) {
    console.error("UPI is not configured — set UPI_ID in .env or siteConfig.upi.vpa.");
    return NextResponse.json(
      { error: "UPI payment isn't set up yet. Please choose Cash on Delivery." },
      { status: 503 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart." }, { status: 400 });
  }

  // Prices come from the catalog, never from the browser. This matters more
  // for UPI than it did for Razorpay: the amount computed here is the amount
  // baked into the QR, so a tampered request would be a discount the
  // customer granted themselves.
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
  const txnRef = makeTxnRef(localOrderId);

  // Saved before the QR goes out so the order exists the moment the customer
  // starts paying, not only once they come back to confirm.
  try {
    const now = new Date().toISOString();
    savePendingOrder({
      id: localOrderId,
      items: orderItems,
      amount,
      currency: siteConfig.currency,
      status: "created",
      customer,
      razorpayOrderId: txnRef,
      shipped: false,
      createdAt: now,
      updatedAt: now,
    });
  } catch (err) {
    console.error("Could not write the pending UPI order:", err);
    return NextResponse.json(
      { error: "Could not save your order. Nothing was charged — please try again." },
      { status: 502 }
    );
  }

  // Shown inside the customer's payment app right above the Pay button, so
  // keep it short and recognisable — long notes get truncated, and some
  // banks reject notes containing punctuation, so letters/digits/spaces only.
  const note = `${siteConfig.name} order ${localOrderId.slice(0, 8)}`.replace(/[^A-Za-z0-9 ]/g, "");

  let links;
  let qrDataUrl;
  try {
    links = buildAppLinks({ amount, note, txnRef });
    qrDataUrl = await buildUpiQrDataUrl(links.any);
  } catch (err) {
    console.error("Could not build the UPI payment link:", err);
    return NextResponse.json(
      { error: "Could not start the payment. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    localOrderId,
    amount,
    currency: siteConfig.currency,
    txnRef,
    qrDataUrl,
    links,
    // Displayed under the QR so the customer can check they're paying the
    // right person before they hand over money.
    payeeVpa: upiConfig.vpa,
    payeeName: upiConfig.payeeName,
  });
}
