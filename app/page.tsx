import Image from "next/image";
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
      {/* Hero — portrait (hero-bg.png) on mobile, landscape (hero-banner.jpg) on sm+ */}
      <section className="relative w-full overflow-hidden bg-[#6b0020] aspect-[3/4] sm:aspect-auto sm:h-[86vh] sm:min-h-[560px]">
        {/* Mobile: portrait image */}
        <Image
          src="/hero-bg.png"
          alt="Jiva Readymadewala"
          fill
          priority
          sizes="100vw"
          className="object-cover sm:hidden select-none"
        />
        {/* Desktop: landscape image */}
        <Image
          src="/hero-banner.jpg"
          alt="Jiva Readymadewala"
          fill
          priority
          sizes="100vw"
          className="hidden sm:block object-contain select-none"
        />

        {/* Radial vignette on edges for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,rgba(60,0,15,0.55)_100%)]" />
      </section>




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
