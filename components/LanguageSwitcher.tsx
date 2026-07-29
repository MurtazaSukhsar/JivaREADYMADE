"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/lib/i18n";

// The popup only appears once. This is how someone changes their mind
// afterwards — or fixes a mis-tap.
export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  if (compact) {
    // Inline row of buttons — used inside the mobile menu, where a dropdown
    // inside a dropdown would be awkward.
    return (
      <div className="flex items-center gap-2 py-2">
        <span className="font-mono text-[11px] uppercase tracking-widest2 text-ash/60">
          {t("nav.language")}
        </span>
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            type="button"
            onClick={() => setLanguage(lang.code)}
            className={`rounded-sm px-2 py-1 font-mono text-[11px] transition-colors ${
              lang.code === language
                ? "bg-ember/15 text-ember"
                : "text-ash hover:text-cream"
            }`}
          >
            {lang.short}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("nav.language")}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full border border-cream/40 px-3 py-1.5 font-mono text-[11px] uppercase tracking-widest2 text-cream transition-colors hover:border-ember hover:text-ember"
      >
        {current.short}
        <span className={`text-[8px] transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-sm border border-line bg-carbon shadow-lift"
        >
          {LANGUAGES.map((lang) => (
            <li key={lang.code}>
              <button
                type="button"
                role="option"
                aria-selected={lang.code === language}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-3.5 py-2.5 text-left font-body text-sm transition-colors ${
                  lang.code === language
                    ? "bg-ember/10 text-ember"
                    : "text-ash hover:bg-slate hover:text-cream"
                }`}
              >
                {lang.native}
                <span className="font-mono text-[10px]">{lang.short}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
