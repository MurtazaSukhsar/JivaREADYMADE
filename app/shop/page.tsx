import { getAllProducts } from "@/lib/products";
import { siteConfig } from "@/lib/config";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <div className="border-b border-line/60 pb-6">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-ember">
          {siteConfig.season} — {products.length} piece{products.length === 1 ? "" : "s"}
        </p>
        <h1 className="mt-2 font-display text-4xl text-cream">The Collection</h1>
      </div>

      {products.length === 0 ? (
        <p className="mt-16 font-body text-ash">
          Nothing in the catalog yet — add a product from the catalog manager and
          it will show up here automatically.
        </p>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
