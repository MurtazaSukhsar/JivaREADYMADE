import { NextRequest, NextResponse } from "next/server";
import { setOrderTrackingNumber } from "@/lib/orders";
import { trackingNumberSchema } from "@/lib/validation";
import { isTrustedOrigin } from "@/lib/origin-check";

// Admin-only (enforced by middleware.ts). Saves the courier's tracking/AWB
// number onto the order's row — separate from the shipped toggle so it can
// be entered whenever the shop owner actually has it in hand.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = trackingNumberSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const order = await setOrderTrackingNumber(params.id, parsed.data.trackingNumber);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save the tracking number.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
