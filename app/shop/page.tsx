import { getAllProducts } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import { getT } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getAllProducts();
  const t = getT();

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      <div className="border-b border-line/60 pb-6">
        <h1 className="font-display text-4xl text-cream">{t("shop.title")}</h1>
      </div>

      {products.length === 0 ? (
        <p className="mt-16 font-body text-ash">{t("shop.empty")}</p>
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
