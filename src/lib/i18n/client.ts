"use client";

import i18n, { type InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";

import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { resources } from "@/lib/i18n/resources";

const i18nOptions: InitOptions = {
  resources,
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  interpolation: {
    escapeValue: false,
  },
  initAsync: false,
  react: {
    useSuspense: false,
  },
};

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init(i18nOptions);
}

export { i18n };
