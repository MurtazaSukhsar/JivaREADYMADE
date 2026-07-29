import { NextRequest, NextResponse } from "next/server";
import { setOrderShipped } from "@/lib/orders";
import { shipOrderSchema } from "@/lib/validation";
import { isTrustedOrigin } from "@/lib/origin-check";

// Admin-only (enforced by middleware.ts). Flips the Shipped column on the
// order's row in the Orders sheet.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = shipOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  try {
    const order = await setOrderShipped(params.id, parsed.data.shipped);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update the order.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
