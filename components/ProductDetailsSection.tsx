"use client";

import { useState } from "react";
import ProductGallery from "./ProductGallery";
import ProductInteractions from "./ProductInteractions";
import { Product } from "@/lib/types";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProductDetailsSection({ product }: { product: Product }) {
  const { t } = useLanguage();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors[0]);

  // "DARK GREEN" and ".../dark-green_01.jpg" should match, so compare with
  // separators and case stripped out rather than raw substrings.
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Handle color selection change
  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor);

    // 1. Name match: does any image URL mention this colour?
    const colorKey = normalize(newColor);
    const matchedIndex = colorKey
      ? product.images.findIndex((img) => normalize(img).includes(colorKey))
      : -1;

    if (matchedIndex !== -1) {
      setActiveImageIndex(matchedIndex);
      return;
    }

    // 2. Fallback: match by index
    const colorIndex = product.colors.indexOf(newColor);
    if (colorIndex !== -1 && colorIndex < product.images.length) {
      setActiveImageIndex(colorIndex);
    }
  };

  // Handle image scroll/click change
  const handleActiveImageChange = (newIndex: number) => {
    setActiveImageIndex(newIndex);

    // 1. Name match first — if the image URL names a colour, trust that over
    // position, otherwise a longer image list drifts out of sync.
    const imageKey = normalize(product.images[newIndex] ?? "");
    const matchedColor = product.colors.find(
      (c) => normalize(c) && imageKey.includes(normalize(c))
    );
    if (matchedColor) {
      setSelectedColor(matchedColor);
      return;
    }

    // 2. Fallback: index match
    if (newIndex < product.colors.length) {
      setSelectedColor(product.colors[newIndex]);
    }
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <ProductGallery 
        images={product.images} 
        alt={product.name} 
        active={activeImageIndex}
        onChangeActive={handleActiveImageChange}
      />

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
          image={product.images[activeImageIndex] ?? product.images[0] ?? ""}
          sizes={product.sizes}
          colors={product.colors}
          color={selectedColor}
          onChangeColor={handleColorChange}
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
  );
}
