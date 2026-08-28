// ============================================================
// @repo/i18n — shared vi / en / ko translations for every surface
// (Expo app, Next.js landing page, admin dashboard).
// ============================================================
import i18next, { type i18n as I18nInstance } from "i18next";
import { initReactI18next } from "react-i18next";

import { en, ko, vi } from "./locales/index";
import { DEFAULT_LANGUAGE, isLanguage, type Language } from "./types";

export * from "./types";
export { en, ko, vi };
export { useTranslation, Trans, I18nextProvider } from "react-i18next";

export const resources = {
  vi: { translation: vi },
  en: { translation: en },
  ko: { translation: ko },
} as const;

interface InitOptions {
  /** Initial language. Falls back to Vietnamese when unknown. */
  language?: string | null;
  /** Enable i18next debug logging (development only). */
  debug?: boolean;
}

/**
 * Idempotent initialiser — safe to call from a React root that re-mounts,
 * and from both the Expo and Next.js entry points.
 */
export function initI18n(options: InitOptions = {}): I18nInstance {
  const lng: Language = isLanguage(options.language) ? options.language : DEFAULT_LANGUAGE;

  if (!i18next.isInitialized) {
    void i18next.use(initReactI18next).init({
      resources,
      lng,
      fallbackLng: DEFAULT_LANGUAGE,
      supportedLngs: ["vi", "en", "ko"],
      defaultNS: "translation",
      interpolation: { escapeValue: false },
      debug: options.debug ?? false,
      // React Native has no <Suspense> boundary around the navigation tree.
      react: { useSuspense: false },
    });
  } else if (i18next.language !== lng) {
    void i18next.changeLanguage(lng);
  }

  return i18next;
}

export function changeLanguage(language: Language): Promise<unknown> {
  return i18next.changeLanguage(language);
}

export function currentLanguage(): Language {
  return isLanguage(i18next.language) ? i18next.language : DEFAULT_LANGUAGE;
}

export { i18next };
