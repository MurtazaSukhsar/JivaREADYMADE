import { NextResponse } from "next/server";
import { getAllProductsAdmin } from "@/lib/products";

// Admin-only: returns all products including hidden ones.
// Middleware already ensures only authenticated requests reach this route.
export async function GET() {
  try {
    const products = await getAllProductsAdmin();
    return NextResponse.json({ products });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load products.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
