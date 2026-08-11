import Link from "next/link";
import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { getT } from "@/lib/i18n-server";

// Reads the Products sheet fresh on every request, newest first, so a
// product added in /admin appears at the top of this page immediately —
// no rebuild, no flag to toggle.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getAllProducts();
  const t = getT();

  return (
    <>
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mb-8 flex items-end justify-between border-b border-line/60 pb-4">
          <div>
            <h2 className="font-display text-3xl text-cream">
              {products.length > 0 ? t("home.newestIn") : t("home.nothingYet")}
            </h2>
          </div>
          <Link
            href="/shop"
            className="font-mono text-[11px] uppercase tracking-widest2 text-ash transition-colors hover:text-cream"
          >
            {t("home.viewAll")}
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="font-body text-sm text-ash">{t("home.emptyHelp")}</p>
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
