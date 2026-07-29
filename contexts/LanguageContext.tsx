"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LANGUAGE_COOKIE,
  LANGUAGE_COOKIE_MAX_AGE,
  getTranslator,
  isLanguage,
  type Language,
  type Translate,
} from "@/lib/i18n";

export type { Language };

export interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  hasChosen: boolean; // false = popup not yet dismissed
  t: Translate;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  hasChosen: true,
  t: getTranslator("en"),
});

// Kept only so visitors who picked a language before the cookie existed
// aren't shown the popup a second time.
const LEGACY_STORAGE_KEY = "jiva_lang";

function writeCookie(lang: Language) {
  document.cookie = `${LANGUAGE_COOKIE}=${lang}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; samesite=lax`;
}

export function LanguageProvider({
  initial,
  children,
}: {
  // Read from the cookie by the server layout. null means this visitor has
  // never chosen — that's what triggers the popup.
  initial: Language | null;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [language, setLanguageState] = useState<Language>(initial ?? "en");
  const [hasChosen, setHasChosen] = useState(initial !== null);

  useEffect(() => {
    if (initial !== null) return;
    const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (isLanguage(stored)) {
      writeCookie(stored);
      setLanguageState(stored);
      setHasChosen(true);
      router.refresh();
    }
  }, [initial, router]);

  const setLanguage = useCallback(
    (lang: Language) => {
      writeCookie(lang);
      localStorage.setItem(LEGACY_STORAGE_KEY, lang);
      setLanguageState(lang);
      setHasChosen(true);
      // Home, shop, product and confirmation are rendered on the server from
      // this cookie, so they need a re-render to pick the new language up.
      router.refresh();
    },
    [router]
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, hasChosen, t: getTranslator(language) }),
    [language, setLanguage, hasChosen]
  );

  // Always render children — the page shows immediately and the modal
  // component layers itself on top when hasChosen is false.
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return useContext(LanguageContext);
}
