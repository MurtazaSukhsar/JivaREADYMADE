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
      <section className="relative h-[86vh] min-h-[560px] w-full overflow-hidden bg-[#6b0020]">
        {/* Logo centered, fully visible — not cropped */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/file_0000000093108209ae4424970778dfdb.png"
            alt="Jiva Readymadewala"
            width={700}
            height={700}
            priority
            className="h-full w-full max-h-[86vh] object-contain select-none"
          />
        </div>

        {/* Radial vignette on edges for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,transparent_40%,rgba(60,0,15,0.55)_100%)]" />

        {/* Bottom gradient so text is always readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

        {/* Text / CTA */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-10 sm:px-8 sm:pb-16">
          <div className="mx-auto max-w-6xl">
            <h1 className="mt-3 max-w-2xl font-display text-4xl italic leading-[1.05] text-cream opacity-0 animate-riseIn [animation-delay:280ms] sm:text-6xl">
              {t("home.heroTitle")}
            </h1>
            <Link
              href="/shop"
              className="mt-6 inline-block rounded-sm bg-cream px-6 py-3 font-mono text-xs uppercase tracking-widest2 text-carbon opacity-0 animate-riseIn [animation-delay:420ms] transition-all duration-200 hover:bg-ember hover:shadow-glow"
            >
              {t("home.shopEdit")}
            </Link>
          </div>
        </div>
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

      <section className="relative overflow-hidden border-y border-line/60 bg-slate px-5 py-16 text-center sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(80%_120%_at_50%_0%,rgba(217,26,60,0.18)_0%,transparent_70%)]" />
        <div className="relative">
          <p className="mx-auto max-w-xl font-display text-2xl italic text-cream sm:text-3xl">
            {t("home.pullQuote")}
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-block rounded-sm border border-cream px-6 py-3 font-mono text-xs uppercase tracking-widest2 text-cream transition-all duration-200 hover:bg-cream hover:text-carbon"
          >
            {t("home.browseCatalog")}
          </Link>
        </div>
      </section>
    </>
  );
}
