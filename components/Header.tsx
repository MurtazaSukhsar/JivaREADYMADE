"use client";

import Link from "next/link";
import { useState } from "react";
import { siteConfig } from "@/lib/config";
import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import type { TranslationKey } from "@/lib/i18n";

// siteConfig.nav is where the shop owner adds links; this maps the ones we
// ship with to a translation key. A link added to siteConfig without an
// entry here just uses its own label, untranslated.
const NAV_KEYS: Record<string, TranslationKey> = {
  "/shop": "nav.shop",
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const { totalCount } = useCart();
  const { t } = useLanguage();

  const label = (href: string, fallback: string) =>
    NAV_KEYS[href] ? t(NAV_KEYS[href]) : fallback;

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-night/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight text-cream transition-colors hover:text-ember"
          onClick={() => setOpen(false)}
        >
          {siteConfig.name}
        </Link>

        <nav className="hidden items-center gap-8 sm:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative font-mono text-[11px] uppercase tracking-widest2 text-cream transition-colors hover:text-ember after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-0 after:bg-ember after:transition-all after:duration-300 hover:after:w-full"
            >
              {label(item.href, item.label)}
            </Link>
          ))}
          <Link
            href="/cart"
            className="group flex items-center gap-2 rounded-full border border-cream/40 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest2 text-cream transition-colors hover:border-ember hover:text-ember"
          >
            {t("nav.bag")}
            {totalCount > 0 && (
              <span className="rounded-full bg-ember px-1.5 py-0.5 text-[10px] leading-none text-carbon">
                {totalCount}
              </span>
            )}
          </Link>
          <LanguageSwitcher />
        </nav>

        <div className="flex items-center gap-4 sm:hidden">
          <Link
            href="/cart"
            className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-widest2 text-cream"
          >
            {t("nav.bag")}
            {totalCount > 0 && (
              <span className="rounded-full bg-ember px-1.5 py-0.5 text-[10px] leading-none text-carbon">
                {totalCount}
              </span>
            )}
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-label={t("nav.toggleMenu")}
            className="flex flex-col gap-1.5"
            onClick={() => setOpen((v) => !v)}
          >
            <span
              className={`h-px w-6 bg-cream transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`}
            />
            <span
              className={`h-px w-6 bg-cream transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`}
            />
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col border-t border-line/70 bg-carbon px-5 py-3 sm:hidden">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="py-2 font-mono text-xs uppercase tracking-widest2 text-cream transition-colors hover:text-ember"
            >
              {label(item.href, item.label)}
            </Link>
          ))}
          <div className="mt-1 border-t border-line/50 pt-1">
            <LanguageSwitcher compact />
          </div>
        </nav>
      )}
    </header>
  );
}
