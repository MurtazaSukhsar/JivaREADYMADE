import { NextRequest, NextResponse } from "next/server";
import { markOrderPaidById } from "@/lib/orders";
import { markPaidSchema } from "@/lib/validation";
import { isTrustedOrigin } from "@/lib/origin-check";

// Admin-only (enforced by middleware.ts). This is the human half of the UPI
// flow: the customer said they paid, you checked the bank, this flips the
// order to "paid". There is no automated equivalent — UPI QR payments don't
// notify the merchant.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = markPaidSchema.safeParse(body);
  if (!parsed.success || !parsed.data.paid) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const order = await markOrderPaidById(params.id);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update the order.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
