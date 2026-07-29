import { NextRequest, NextResponse } from "next/server";
import { updateProduct, setProductHidden, deleteProduct } from "@/lib/products";
import { isTrustedOrigin } from "@/lib/origin-check";

// PATCH /api/products/[id]  — edit fields or toggle hidden
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const rowNumber = parseInt(params.id, 10);
  if (!Number.isFinite(rowNumber) || rowNumber < 2) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  try {
    // Toggle hidden flag
    if (typeof body.hidden === "boolean") {
      await setProductHidden(rowNumber, body.hidden);
      return NextResponse.json({ ok: true });
    }

    // Full update
    await updateProduct(rowNumber, {
      name: body.name,
      price: Number(body.price),
      sizes: String(body.sizes ?? "").split(",").map((s: string) => s.trim()).filter(Boolean),
      colors: String(body.colors ?? "").split(",").map((c: string) => c.trim()).filter(Boolean),
      description: body.description ?? "",
      images: String(body.images ?? "").split(",").map((i: string) => i.trim()).filter(Boolean),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update product.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

// DELETE /api/products/[id]  — permanently clear the row
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const rowNumber = parseInt(params.id, 10);
  if (!Number.isFinite(rowNumber) || rowNumber < 2) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  try {
    await deleteProduct(rowNumber);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not delete product.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
