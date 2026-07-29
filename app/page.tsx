
import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import { siteConfig } from "@/lib/config";
import ProductCard from "@/components/ProductCard";


// Reads data/products.json fresh on every request, newest first, so a
// product added in /admin appears at the top of this page immediately —
// no rebuild, no flag to toggle.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getAllProducts();


  return (
    <>



      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mb-8 flex items-end justify-between border-b border-line/60 pb-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest2 text-ember">
              {siteConfig.season}
            </p>
            <h2 className="mt-1 font-display text-3xl text-cream">
              {products.length > 0 ? "Newest In" : "Nothing here yet"}
            </h2>
          </div>
          <Link
            href="/shop"
            className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-cream"
          >
            View all →
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="font-body text-sm text-ash">
            Add your first product from the catalog manager and it&apos;ll show up
            right here.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>


    </>
  );
}
