import { NextRequest, NextResponse } from "next/server";
import { updateOrderCustomer } from "@/lib/orders";
import { customerSchema } from "@/lib/validation";
import { isTrustedOrigin } from "@/lib/origin-check";

// Admin-only (enforced by middleware.ts). Saves the edited customer details
// onto the order's row in the Orders sheet.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Invalid customer data.";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  try {
    const order = await updateOrderCustomer(params.id, parsed.data);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update the order.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
