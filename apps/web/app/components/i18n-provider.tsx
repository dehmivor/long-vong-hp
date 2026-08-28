"use client";

import {
  DEFAULT_LANGUAGE,
  I18nextProvider,
  LANGUAGE_FLAGS,
  LANGUAGE_LABELS,
  SUPPORTED_LANGUAGES,
  changeLanguage as applyLanguage,
  initI18n,
  isLanguage,
  type Language,
} from "@repo/i18n";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "lvhp.language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
});

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Always render Vietnamese on the server and the first client paint so the
  // markup matches; the stored/browser preference is applied after hydration.
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const i18n = useMemo(() => initI18n({ language: DEFAULT_LANGUAGE }), []);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const browser = window.navigator.language.split("-")[0];
    const preferred = isLanguage(stored) ? stored : isLanguage(browser) ? browser : null;

    if (preferred && preferred !== DEFAULT_LANGUAGE) {
      setLanguageState(preferred);
      void applyLanguage(preferred);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    void applyLanguage(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Private-mode browsers reject writes; the choice still applies this session.
    }
  }, []);

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
    </I18nextProvider>
  );
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {SUPPORTED_LANGUAGES.map((code) => (
        <button
          key={code}
          type="button"
          className={`lang-option ${code === language ? "active" : ""}`}
          onClick={() => setLanguage(code)}
          aria-pressed={code === language}
          title={LANGUAGE_LABELS[code]}
        >
          <span aria-hidden="true">{LANGUAGE_FLAGS[code]}</span>
          <span className="lang-code">{code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
