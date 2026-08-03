import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getProductBySlug } from "@/lib/products";
import { savePendingOrder } from "@/lib/pending-orders";
import { getRazorpayClient, toSubunits } from "@/lib/razorpay";
import { getDeliveryFee } from "@/lib/format";
import { createOrderSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isTrustedOrigin } from "@/lib/origin-check";
import { siteConfig } from "@/lib/config";
import { OrderItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const ip = getClientIp(req);
  const { allowed } = rateLimit(`checkout:${ip}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart." }, { status: 400 });
  }

  // The client sends product slugs + quantities only. Every price below
  // comes from the catalog on disk, not from anything the browser sent —
  // this is what stops someone from editing the request to pay less.
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

  let razorpayOrder;
  try {
    const client = getRazorpayClient();
    razorpayOrder = await client.orders.create({
      amount: toSubunits(amount),
      currency: siteConfig.currency,
      receipt: localOrderId,
    });
  } catch (err: any) {
    console.error("Razorpay error:", err);
    const message = err?.error?.description || err?.message || "Razorpay isn't configured yet.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  let order;
  try {
    const now = new Date().toISOString();
    order = {
      id: localOrderId,
      items: orderItems,
      amount,
      currency: siteConfig.currency,
      status: "created",
      customer,
      razorpayOrderId: razorpayOrder.id,
      shipped: false,
      createdAt: now,
      updatedAt: now,
    };
    savePendingOrder(order);
  } catch (err) {
    console.error("Could not write the pending order:", err);
    return NextResponse.json(
      { error: "Could not save your order. Nothing was charged — please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    localOrderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amountInSubunits: toSubunits(amount),
    currency: siteConfig.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    // Pre-fills the Razorpay dialog so the customer doesn't retype what
    // they just entered on our form.
    prefill: {
      name: customer.name,
      email: customer.email,
      contact: customer.phone,
    },
  });
}
