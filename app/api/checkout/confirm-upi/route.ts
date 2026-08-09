import { NextRequest, NextResponse } from "next/server";
import { getOrderById, markOrderUpiPending } from "@/lib/orders";
import { confirmUpiSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isTrustedOrigin } from "@/lib/origin-check";

// The customer has paid by UPI and (optionally) typed in the reference
// number their app gave them.
//
// IMPORTANT: this endpoint cannot verify anything. UPI collect-by-QR gives
// the merchant no callback, so all we have is the customer's word plus a
// reference number to search the bank statement with. The order is therefore
// moved to `upi_pending`, and the shop owner presses "Mark paid" in the
// admin panel once the money is actually visible in the account.
//
// The amount is never taken from this request — it was priced by the server
// when the order was created and is already on the sheet.
export async function POST(req: NextRequest) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const ip = getClientIp(req);
  const { allowed } = rateLimit(`confirm-upi:${ip}`, { limit: 20, windowMs: 10 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const parsed = confirmUpiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const { localOrderId, upiRef } = parsed.data;

  const order = await getOrderById(localOrderId);
  if (!order) {
    return NextResponse.json(
      { error: "This order has expired. Please add your items again." },
      { status: 404 }
    );
  }

  // Already confirmed by hand? Don't drag a paid order backwards because
  // someone double-tapped or reloaded.
  if (order.status === "paid") {
    return NextResponse.json({ ok: true, orderId: order.id });
  }

  try {
    await markOrderUpiPending(localOrderId, upiRef);
  } catch (err) {
    console.error("Could not record the UPI payment claim:", err);
    return NextResponse.json(
      { error: "Could not save your order. Please message us on WhatsApp." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, orderId: order.id });
}
