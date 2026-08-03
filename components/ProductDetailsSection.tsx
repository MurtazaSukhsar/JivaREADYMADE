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

  // Handle color selection change
  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor);
    
    // We want to find the corresponding image.
    // 1. Let's try name matching: see if any image URL contains the color name (case-insensitive)
    const colorLower = newColor.toLowerCase();
    const matchedIndex = product.images.findIndex(img => 
      img.toLowerCase().includes(colorLower)
    );
    
    if (matchedIndex !== -1) {
      setActiveImageIndex(matchedIndex);
    } else {
      // 2. Fallback: match by index
      const colorIndex = product.colors.indexOf(newColor);
      if (colorIndex !== -1 && colorIndex < product.images.length) {
        setActiveImageIndex(colorIndex);
      }
    }
  };

  // Handle image scroll/click change
  const handleActiveImageChange = (newIndex: number) => {
    setActiveImageIndex(newIndex);
    
    // We want to find the corresponding color.
    // 1. Try index match: if index is within colors range
    if (newIndex < product.colors.length) {
      setSelectedColor(product.colors[newIndex]);
    } else {
      // 2. Fallback: try name matching in the image URL at this index
      const imageUrl = product.images[newIndex]?.toLowerCase() || "";
      const matchedColor = product.colors.find(c => 
        imageUrl.includes(c.toLowerCase())
      );
      if (matchedColor) {
        setSelectedColor(matchedColor);
      }
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
