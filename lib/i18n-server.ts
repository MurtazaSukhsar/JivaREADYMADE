import { cookies } from "next/headers";
import { LANGUAGE_COOKIE, getTranslator, isLanguage, type Language, type Translate } from "./i18n";

// Server components read the language from the cookie rather than from
// localStorage, so the very first HTML the browser receives is already in
// the right language — no English flash, no hydration mismatch.

export function getLanguage(): Language {
  const value = cookies().get(LANGUAGE_COOKIE)?.value;
  return isLanguage(value) ? value : "en";
}

export function getT(): Translate {
  return getTranslator(getLanguage());
}
