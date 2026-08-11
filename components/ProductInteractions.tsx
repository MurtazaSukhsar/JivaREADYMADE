"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/format";
import { siteConfig } from "@/lib/config";

export default function ProductInteractions({
  slug,
  name,
  price,
  image,
  sizes,
  colors,
  color: propColor,
  onChangeColor,
}: {
  slug: string;
  name: string;
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
  color?: string;
  onChangeColor?: (color: string) => void;
}) {
  const { addItem, clear } = useCart();
  const { t } = useLanguage();
  const router = useRouter();
  const [size, setSize] = useState<string | undefined>(undefined);
  const [localColor, setLocalColor] = useState<string | undefined>(colors[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isControlled = propColor !== undefined;
  const color = isControlled ? propColor : localColor;

  const handleColorSelect = (c: string) => {
    if (onChangeColor) {
      onChangeColor(c);
    } else {
      setLocalColor(c);
    }
  };

  const handleBuyNow = () => {
    if (sizes.length > 0 && !size) {
      setError(t("product.selectSizeError"));
      return;
    }
    setError(null);
    clear();
    addItem({ slug, name, price, image, size, color }, quantity);
    router.push("/checkout");
  };

  const handleAdd = () => {
    if (sizes.length > 0 && !size) {
      setError(t("product.selectSizeError"));
      return;
    }
    setError(null);
    addItem({ slug, name, price, image, size, color }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleSizeSelect = (s: string) => {
    setSize(s);
    setError(null);
  };

  // Matches cartItemSchema's max(20) in lib/validation.ts — the server
  // rejects anything past that, so the stepper stops there too.
  const decreaseQty = () => setQuantity((q) => Math.max(1, q - 1));
  const increaseQty = () => setQuantity((q) => Math.min(20, q + 1));

  const chip = (selected: boolean) =>
    `rounded-sm border px-3 py-1.5 font-mono text-xs uppercase transition-all duration-200 ${
      selected
         ? "border-ember bg-ember/15 text-cream"
        : "border-line text-ash hover:border-ash hover:text-cream"
    }`;

  return (
    <div>
      {sizes.length > 0 && (
        <div className="mt-6">
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash/70">
            {t("product.size")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleSizeSelect(s)}
                className={chip(size === s)}
              >
                {s}
              </button>
            ))}
          </div>
          {error && (
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wide text-cream animate-pulse">
              ⚠️ {error}
            </p>
          )}
        </div>
      )}

      {colors.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash/70">
            {t("product.color")}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleColorSelect(c)}
                className={chip(color === c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash/70">
          {t("product.quantity")}
        </p>
        <div className="mt-2 flex items-center rounded-sm border border-line w-fit">
          <button
            type="button"
            onClick={decreaseQty}
            className="px-3.5 py-1.5 font-mono text-sm text-ash transition-colors hover:bg-line/40 hover:text-cream"
            aria-label={t("cart.decrease")}
          >
            −
          </button>
          <span className="min-w-[2.5rem] text-center font-mono text-sm text-cream">
            {quantity}
          </span>
          <button
            type="button"
            onClick={increaseQty}
            className="px-3.5 py-1.5 font-mono text-sm text-ash transition-colors hover:bg-line/40 hover:text-cream"
            aria-label={t("cart.increase")}
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line/60 pt-5">
        <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash/70">
          {t("common.total")}
        </p>
        <span className="whitespace-nowrap rounded-sm border border-line bg-slate px-4 py-1.5 font-display text-2xl text-cream">
          {formatPrice(price * quantity, siteConfig.currency)}
        </span>
      </div>

      <button
        type="button"
        onClick={handleBuyNow}
        className="mt-6 w-full rounded-sm bg-ember py-3.5 font-mono text-sm uppercase tracking-widest2 text-cream transition-all duration-200 hover:brightness-110 hover:shadow-glow"
      >
        {t("product.buyNow")}
      </button>

      <button
        type="button"
        onClick={handleAdd}
        className="mt-3 w-full rounded-sm bg-ember py-3.5 font-mono text-sm uppercase tracking-widest2 text-cream transition-all duration-200 hover:brightness-110 hover:shadow-glow"
      >
        {added ? t("product.added") : t("product.addToBag")}
      </button>
      {added && (
        <div className="mt-2 font-body text-xs text-ash/80">
          <p>{t("product.addedNote")}</p>
          <Link
            href="/cart"
            className="mt-1 inline-block text-ember underline underline-offset-2"
          >
            {t("product.viewBag")}
          </Link>
        </div>
      )}
    </div>
  );
}
