import { NextResponse } from "next/server";
import { getAllOrders } from "@/lib/orders";

// middleware.ts rejects unauthenticated requests to /api/orders before this
// handler runs — order data includes customer addresses and phone numbers,
// so there is no public variant of this route.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const orders = await getAllOrders();
    return NextResponse.json({ orders });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not read orders.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
