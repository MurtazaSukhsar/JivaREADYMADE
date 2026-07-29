"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/contexts/CartContext";

export default function ProductInteractions({
  slug,
  name,
  price,
  image,
  sizes,
  colors,
}: {
  slug: string;
  name: string;
  price: number;
  image: string;
  sizes: string[];
  colors: string[];
}) {
  const { addItem } = useCart();
  const [size, setSize] = useState<string | undefined>(sizes[0]);
  const [color, setColor] = useState<string | undefined>(colors[0]);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ slug, name, price, image, size, color });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

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
            Size
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={chip(size === s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[11px] uppercase tracking-widest2 text-ash/70">
            Color
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={chip(color === c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleAdd}
        className="mt-8 w-full rounded-sm bg-ember py-3.5 font-mono text-xs uppercase tracking-widest2 text-carbon transition-all duration-200 hover:shadow-glow hover:brightness-110"
      >
        {added ? "Added" : "Add to bag"}
      </button>
      {added && (
        <p className="mt-2 font-body text-xs text-ash/80">
          In your{" "}
          <Link href="/cart" className="text-ember underline underline-offset-2">
            bag
          </Link>
          . Price shown here is for reference — checkout always confirms the
          current price from the catalog.
        </p>
      )}
    </div>
  );
}
