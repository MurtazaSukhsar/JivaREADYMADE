"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ProductGallery({
  images,
  alt,
  active: propActive,
  onChangeActive,
}: {
  images: string[];
  alt: string;
  active?: number;
  onChangeActive?: (index: number) => void;
}) {
  const [localActive, setLocalActive] = useState(0);
  const { t } = useLanguage();
  const gallery = images.length > 0 ? images : ["https://picsum.photos/seed/placeholder/900/1125"];

  const isControlled = propActive !== undefined;
  const active = isControlled ? propActive : localActive;

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.clientWidth === 0) return;
    const index = Math.round(target.scrollLeft / target.clientWidth);
    if (index !== active && index >= 0 && index < gallery.length) {
      if (onChangeActive) {
        onChangeActive(index);
      } else {
        setLocalActive(index);
      }
    }
  };

  const scrollToImage = (index: number) => {
    if (onChangeActive) {
      onChangeActive(index);
    } else {
      setLocalActive(index);
    }
    if (scrollRef.current) {
      const container = scrollRef.current;
      if (container.clientWidth > 0) {
        container.scrollTo({
          left: container.clientWidth * index,
          behavior: "smooth",
        });
      }
    }
  };

  // Sync scroll position when active changes externally
  useEffect(() => {
    if (isControlled && scrollRef.current) {
      const container = scrollRef.current;
      if (container.clientWidth > 0) {
        const expectedLeft = container.clientWidth * active;
        if (Math.abs(container.scrollLeft - expectedLeft) > 5) {
          container.scrollTo({
            left: expectedLeft,
            behavior: "smooth",
          });
        }
      }
    }
  }, [active, isControlled]);

  return (
    <div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none rounded-sm bg-slate ring-1 ring-line/60 shadow-lift"
      >
        {gallery.map((src, i) => (
          <div key={src + i} className="w-full shrink-0 snap-center">
            <Image
              src={src}
              alt={`${alt} - Image ${i + 1}`}
              width={800}
              height={1000}
              priority={i === 0}
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="w-full h-auto"
            />
          </div>
        ))}
      </div>

      {gallery.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {gallery.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => scrollToImage(i)}
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
