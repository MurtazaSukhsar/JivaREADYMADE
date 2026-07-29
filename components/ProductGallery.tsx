"use client";

import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const { t } = useLanguage();
  const gallery = images.length > 0 ? images : ["https://picsum.photos/seed/placeholder/900/1125"];

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-slate ring-1 ring-line/60 shadow-lift">
        <Image
          src={gallery[active]}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {gallery.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={t("product.showImage", { n: i + 1 })}
              className={`relative aspect-[4/5] overflow-hidden rounded-sm bg-slate transition-all duration-300 ${
                i === active
                  ? "opacity-100 ring-1 ring-ember"
                  : "opacity-50 ring-1 ring-line/50 hover:opacity-85 hover:ring-line"
              }`}
            >
              <Image src={src} alt="" fill sizes="20vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
