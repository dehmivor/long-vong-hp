import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_LANGUAGE,
  I18nextProvider,
  changeLanguage as applyLanguage,
  initI18n,
  isLanguage,
  type Language,
} from '@repo/i18n';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getLocales } from 'expo-localization';

const LANGUAGE_KEY = 'lvhp.language';

/** Device locale, when it is one we actually ship. Otherwise Vietnamese. */
function deviceLanguage(): Language {
  const tag = getLocales()[0]?.languageCode ?? DEFAULT_LANGUAGE;
  return isLanguage(tag) ? tag : DEFAULT_LANGUAGE;
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  /** False until the stored preference has been read back from AsyncStorage. */
  ready: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: DEFAULT_LANGUAGE,
  setLanguage: async () => {},
  ready: false,
});

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Start on the device locale so the very first frame is already close to
  // right; the stored preference (if any) overrides it a tick later.
  const [language, setLanguageState] = useState<Language>(deviceLanguage);
  const [ready, setReady] = useState(false);

  const i18n = useMemo(() => initI18n({ language: deviceLanguage(), debug: __DEV__ }), []);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(LANGUAGE_KEY)
      .then((stored) => {
        if (cancelled) return;
        if (isLanguage(stored)) {
          setLanguageState(stored);
          void applyLanguage(stored);
        }
      })
      .catch(() => {
        // A missing/corrupt preference is not worth surfacing — keep the device locale.
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback(async (next: Language) => {
    setLanguageState(next);
    await applyLanguage(next);
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, next);
    } catch {
      // Preference is applied for this session even if it cannot be persisted.
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, ready }),
    [language, setLanguage, ready],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
    </I18nextProvider>
  );
}
