import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getProductBySlug, getAllProducts } from "@/lib/products";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/config";
import ProductGallery from "@/components/ProductGallery";
import ProductInteractions from "@/components/ProductInteractions";
import ProductCard from "@/components/ProductCard";
import { getT } from "@/lib/i18n-server";

// Every row in the catalog gets rendered by this one template — no page
// needs to be created by hand when a product is added.
export const dynamic = "force-dynamic";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: "Product not found" };

  return {
    title: `${product.name} — ${siteConfig.name}`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = (await getAllProducts())
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
  const t = getT();

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <nav className="font-mono text-[11px] uppercase tracking-widest2 text-ash/70">
        <Link href="/shop" className="transition-colors hover:text-ember">
          {t("nav.shop")}
        </Link>{" "}
        / <span className="text-cream">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={product.images} alt={product.name} />

        <div className="lg:pt-2">
          <div>
            <h1 className="font-display text-4xl text-cream sm:text-5xl">
              {product.name}
            </h1>
          </div>

          <p className="mt-6 max-w-md font-body text-base leading-loose text-ash">
            {product.description}
          </p>

          <ProductInteractions
            slug={product.slug}
            name={product.name}
            price={product.price}
            image={product.images[0] ?? ""}
            sizes={product.sizes}
            colors={product.colors}
          />

          <div className="mt-10 border-t border-line/60 pt-6">
            <p className="font-mono text-[13px] uppercase tracking-widest2 text-ash/70">
              {t("product.details")}
            </p>
            <ul className="mt-3 space-y-2 font-body text-base text-ash">
              <li>{t("product.shipsIn")}</li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-20 border-t border-line/60 pt-10">
          <h2 className="font-display text-3xl text-cream">{t("product.alsoLike")}</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
