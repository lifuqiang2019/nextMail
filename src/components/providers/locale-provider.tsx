"use client";

import { useRouter } from "next/navigation";
import { I18nextProvider } from "react-i18next";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { i18n } from "@/lib/i18n/client";
import {
  LOCALE_COOKIE_NAME,
  LOCALE_STORAGE_KEY,
  normalizeLocale,
  type AppLocale,
} from "@/lib/i18n/config";

type LocaleContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const LOCALE_EVENT = "nextmail-locale-updated";

function persistLocale(locale: AppLocale) {
  if (typeof document !== "undefined") {
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = locale;
  }

  if (typeof window !== "undefined") {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    window.dispatchEvent(new Event(LOCALE_EVENT));
  }
}

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: AppLocale;
}) {
  const router = useRouter();
  const fallbackLocale = normalizeLocale(initialLocale);
  const [locale, setLocaleState] = useState<AppLocale>(() => {
    if (i18n.resolvedLanguage !== fallbackLocale) {
      void i18n.changeLanguage(fallbackLocale);
    }

    return fallbackLocale;
  });

  useEffect(() => {
    setLocaleState((current) => (current === fallbackLocale ? current : fallbackLocale));
  }, [fallbackLocale]);

  useEffect(() => {
    persistLocale(locale);
    if (i18n.resolvedLanguage !== locale) {
      void i18n.changeLanguage(locale);
    }
  }, [locale]);

  const setLocale = useCallback(
    (nextLocale: AppLocale) => {
      const normalized = normalizeLocale(nextLocale);
      if (locale === normalized) {
        return;
      }

      setLocaleState(normalized);
      persistLocale(normalized);
      void i18n.changeLanguage(normalized);
      router.refresh();
    },
    [locale, router],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
    }),
    [locale, setLocale],
  );

  return (
    <I18nextProvider i18n={i18n}>
      <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
    </I18nextProvider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
