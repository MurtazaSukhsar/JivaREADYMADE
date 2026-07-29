import { NextRequest, NextResponse } from "next/server";
import { addProduct, getAllProducts } from "@/lib/products";
import { newProductSchema } from "@/lib/validation";
import { isTrustedOrigin } from "@/lib/origin-check";

export async function GET() {
  const products = await getAllProducts();
  return NextResponse.json({ products });
}

// Note: middleware.ts already rejects unauthenticated requests to this route
// before this handler ever runs.
export async function POST(req: NextRequest) {
  if (!isTrustedOrigin(req)) {
    return NextResponse.json({ error: "Request rejected." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = newProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid product data." },
      { status: 400 }
    );
  }

  try {
    const product = await addProduct(parsed.data);
    return NextResponse.json({ product }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save the product.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
