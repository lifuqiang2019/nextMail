"use client";

import { useRouter } from "next/navigation";
import { I18nextProvider } from "react-i18next";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
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

function readStoredLocale(fallbackLocale: AppLocale) {
  if (typeof window === "undefined") {
    return fallbackLocale;
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return storedLocale ? normalizeLocale(storedLocale) : fallbackLocale;
}

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

function subscribeLocale(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(LOCALE_EVENT, handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(LOCALE_EVENT, handler);
  };
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
  const locale = useSyncExternalStore(
    subscribeLocale,
    () => readStoredLocale(fallbackLocale),
    () => fallbackLocale,
  );

  useEffect(() => {
    persistLocale(locale);
    void i18n.changeLanguage(locale);
  }, [locale]);

  const setLocale = useCallback(
    (nextLocale: AppLocale) => {
      const normalized = normalizeLocale(nextLocale);
      if (locale === normalized) {
        return;
      }

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
