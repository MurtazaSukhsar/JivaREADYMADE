import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getProductBySlug } from "@/lib/products";
import { savePendingOrder } from "@/lib/pending-orders";
import { getRazorpayClient, toSubunits } from "@/lib/razorpay";
import { getCodAdvance } from "@/lib/format";
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
  const { allowed } = rateLimit(`checkout-cod:${ip}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart." }, { status: 400 });
  }

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
  const amount = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if (amount <= 0) {
    return NextResponse.json({ error: "Cart total must be greater than zero." }, { status: 400 });
  }

  const localOrderId = crypto.randomUUID();
  const totalQty = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const advanceAmount = getCodAdvance(totalQty);

  // Create a Razorpay order for dynamic advance payment
  let razorpayOrder;
  try {
    const client = getRazorpayClient();
    razorpayOrder = await client.orders.create({
      amount: toSubunits(advanceAmount),
      currency: siteConfig.currency,
      receipt: localOrderId,
    });
  } catch (err: any) {
    console.error("Razorpay error for COD advance:", err);
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
      status: "created" as const,
      customer,
      razorpayOrderId: razorpayOrder.id,
      shipped: false,
      createdAt: now,
      updatedAt: now,
    };
    await savePendingOrder(order);
  } catch (err) {
    console.error("Could not write the pending COD order:", err);
    return NextResponse.json(
      { error: "Could not save your order. Please try again." },
      { status: 502 }
    );
  }

  return NextResponse.json({
    localOrderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amountInSubunits: toSubunits(advanceAmount),
    currency: siteConfig.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    prefill: {
      name: customer.name,
      email: customer.email,
      contact: customer.phone,
    },
  });
}
