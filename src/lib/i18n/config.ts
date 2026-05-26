export const LOCALE_COOKIE_NAME = "nextmail-locale";
export const LOCALE_STORAGE_KEY = "nextmail-locale";

export const SUPPORTED_LOCALES = ["zh-CN", "en-US"] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en-US";

const LOCALE_ALIASES: Record<string, AppLocale> = {
  zh: "zh-CN",
  "zh-cn": "zh-CN",
  en: "en-US",
  "en-us": "en-US",
};

export function normalizeLocale(locale?: string | null): AppLocale {
  if (!locale) {
    return DEFAULT_LOCALE;
  }

  const normalized = locale.toLowerCase();

  if (normalized in LOCALE_ALIASES) {
    return LOCALE_ALIASES[normalized];
  }

  return SUPPORTED_LOCALES.includes(locale as AppLocale) ? (locale as AppLocale) : DEFAULT_LOCALE;
}

export function getLocaleShortLabel(locale: AppLocale) {
  return locale === "zh-CN" ? "中" : "EN";
}

export function getLocaleLabel(locale: AppLocale) {
  return locale === "zh-CN" ? "中文" : "English";
}
