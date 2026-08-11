import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/config";

export default function ProductCard({ product }: { product: Product }) {
  const [primary, secondary] = product.images;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-slate ring-1 ring-line/60 transition-all duration-500 group-hover:ring-ember/50 group-hover:shadow-lift">
        <Image
          src={primary}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className={`object-cover transition-all duration-700 ${
            secondary ? "group-hover:opacity-0" : "group-hover:scale-[1.04]"
          }`}
        />
        {secondary && (
          <Image
            src={secondary}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}

        {/* bottom scrim keeps type legible over bright product shots */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-carbon/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </div>

      <div className="mt-3 flex items-start justify-between gap-2">
        <h3 className="font-display text-lg leading-tight text-cream transition-colors group-hover:text-ember">
          {product.name}
        </h3>
        <p className="whitespace-nowrap pt-1 font-display text-base text-ash">
          {formatPrice(product.price, siteConfig.currency)}
        </p>
      </div>
    </Link>
  );
}
