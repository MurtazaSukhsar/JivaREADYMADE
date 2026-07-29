import "server-only";
import { Product, NewProductInput } from "./types";
import { readSheetRows, appendSheetRow } from "./google-sheets";

// Products now live in a Google Sheet instead of a local file, so whoever
// runs the shop can add or edit products directly in the spreadsheet — the
// admin form still works too (it just appends a row to the same sheet).
//
// Sheet layout, one tab named exactly "Products", header row + data from
// row 2 down:
//   A: Name | B: Price | C: Sizes | D: Colors | E: Description | F: Image URLs
// Sizes/Colors/Image URLs are comma-separated within their cell.
//
// There's deliberately no "date added" column: Sheets always appends new
// rows at the bottom, so reversing the read order gives newest-first with
// no timestamp bookkeeping required — whether the row came from the admin
// form or was typed straight into the sheet.

const SHEET_RANGE_READ = "Products!A2:F";
const SHEET_RANGE_APPEND = "Products!A:F";
const CACHE_TTL_MS = 60_000;

function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) {
    throw new Error("GOOGLE_SHEET_ID is not set — see .env.example.");
  }
  return id;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function placeholderImage(seed: string): string {
  return `https://picsum.photos/seed/${seed}/900/1125`;
}

function parseRow(row: string[], rowNumber: number): Product | null {
  const name = String(row[0] ?? "").trim();
  const price = Number(row[1]);
  if (!name || !Number.isFinite(price) || price <= 0) return null;

  const sizes = String(row[2] ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const colors = String(row[3] ?? "").split(",").map((c) => c.trim()).filter(Boolean);
  const description = String(row[4] ?? "").trim();
  const images = String(row[5] ?? "").split(",").map((i) => i.trim()).filter(Boolean);

  const baseSlug = slugify(name) || `product-${rowNumber}`;

  return {
    id: `row-${rowNumber}`,
    slug: baseSlug,
    name,
    price,
    styleCode: `STY-${String(rowNumber).padStart(3, "0")}`,
    sizes,
    colors,
    description,
    // Applied at read time (not just on admin-form submit) so a row typed
    // directly into the sheet with no image column also gets a placeholder.
    images: images.length > 0 ? images : [placeholderImage(baseSlug)],
    createdAt: new Date(0).toISOString(), // unused for ordering — see note above
  };
}

let cache: { data: Product[]; expiresAt: number } | null = null;

async function fetchAllFromSheet(): Promise<Product[]> {
  const rows = await readSheetRows(getSheetId(), SHEET_RANGE_READ);

  const products: Product[] = [];
  const seenSlugs = new Set<string>();

  rows.forEach((row, i) => {
    const rowNumber = i + 2; // row 1 is the header
    const product = parseRow(row, rowNumber);
    if (!product) return;

    let slug = product.slug;
    let n = 2;
    while (seenSlugs.has(slug)) {
      slug = `${product.slug}-${n}`;
      n += 1;
    }
    seenSlugs.add(slug);

    products.push({ ...product, slug });
  });

  return products.reverse(); // bottom row (newest) first
}

export async function getAllProducts(): Promise<Product[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.data;

  try {
    const data = await fetchAllFromSheet();
    cache = { data, expiresAt: now + CACHE_TTL_MS };
    return data;
  } catch (err) {
    // Don't take the whole storefront down if the sheet is briefly
    // unreachable — serve the last known good list if we have one.
    console.error("Failed to read products from Google Sheets:", err);
    if (cache) return cache.data;
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const products = await getAllProducts();
  return products.find((p) => p.slug === slug) ?? null;
}

export async function addProduct(input: NewProductInput): Promise<Product> {
  await appendSheetRow(getSheetId(), SHEET_RANGE_APPEND, [
    input.name,
    input.price,
    input.sizes.join(", "),
    input.colors.join(", "),
    input.description,
    input.images.join(", "),
  ]);

  cache = null; // this path stays instant even though direct sheet edits take up to a minute

  const products = await getAllProducts();
  const created = products.find((p) => p.name === input.name);
  if (!created) {
    throw new Error("Saved to the sheet, but couldn't read it back — check the sheet manually.");
  }
  return created;
}
