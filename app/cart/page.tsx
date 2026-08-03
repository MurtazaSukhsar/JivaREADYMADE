"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/config";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { t } = useLanguage();

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-24 text-center sm:px-8">
        <h1 className="font-display text-3xl text-cream">{t("cart.emptyTitle")}</h1>
        <p className="mt-3 font-body text-sm text-ash">{t("cart.emptyBody")}</p>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-sm border border-line px-6 py-3 font-mono text-xs uppercase tracking-widest2 text-cream transition-all duration-200 hover:border-ember hover:text-ember"
        >
          {t("cart.browse")}
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8">
      <h1 className="font-display text-3xl text-cream">{t("cart.title")}</h1>

      <div className="mt-8 divide-y divide-line/50 rounded-sm border border-line/50 bg-slate/40 px-4">
        {items.map((item) => (
          <div
            key={`${item.slug}-${item.size}-${item.color}`}
            className="flex gap-4 py-5"
          >
            <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-sm bg-slate ring-1 ring-line/60">
              {item.image && (
                <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg text-cream">{item.name}</p>
                  <p className="font-mono text-xs uppercase tracking-wide text-ash/70">
                    {[item.size, item.color].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <p className="whitespace-nowrap font-body text-sm text-cream">
                  {formatPrice(item.price, siteConfig.currency)}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center rounded-sm border border-line">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.slug, item.size, item.color, item.quantity - 1)}
                    className="px-3 py-1 font-mono text-sm text-ash transition-colors hover:bg-line/40 hover:text-cream"
                    aria-label={t("cart.decrease")}
                  >
                    −
                  </button>
                  <span className="min-w-[2rem] text-center font-mono text-sm text-cream">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.slug, item.size, item.color, item.quantity + 1)}
                    className="px-3 py-1 font-mono text-sm text-ash transition-colors hover:bg-line/40 hover:text-cream"
                    aria-label={t("cart.increase")}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.slug, item.size, item.color)}
                  className="font-mono text-[11px] uppercase tracking-widest2 text-ash/60 transition-colors hover:text-ember"
                >
                  {t("cart.remove")}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="font-mono text-sm uppercase tracking-widest2 text-ash">
          {t("cart.subtotal")}
        </p>
        <p className="font-display text-2xl text-cream">
          {formatPrice(subtotal, siteConfig.currency)}
        </p>
      </div>
      <p className="mt-1 font-body text-xs text-ash/60">{t("cart.subtotalNote")}</p>

      <Link
        href="/checkout"
        className="mt-6 block rounded-sm bg-ember py-3.5 text-center font-mono text-xs uppercase tracking-widest2 text-carbon transition-all duration-200 hover:shadow-glow hover:brightness-110"
      >
        {t("cart.checkout")}
      </Link>
    </section>
  );
}
