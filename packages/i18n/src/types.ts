import type { vi } from "./locales/vi";

/**
 * Vietnamese is the source of truth for the key set. `as const` on `vi` gives us
 * literal string types, which would force every other locale to repeat the exact
 * same strings — so widen the leaves back to `string` while keeping the shape.
 */
type Widen<T> = T extends string ? string : { [K in keyof T]: Widen<T[K]> };

export type Translation = Widen<typeof vi>;

export const SUPPORTED_LANGUAGES = ["vi", "en", "ko"] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "vi";

export const LANGUAGE_LABELS: Record<Language, string> = {
  vi: "Tiếng Việt",
  en: "English",
  ko: "한국어",
};

export const LANGUAGE_FLAGS: Record<Language, string> = {
  vi: "🇻🇳",
  en: "🇬🇧",
  ko: "🇰🇷",
};

export function isLanguage(value: unknown): value is Language {
  return (
    typeof value === "string" && (SUPPORTED_LANGUAGES as readonly string[]).includes(value)
  );
}
