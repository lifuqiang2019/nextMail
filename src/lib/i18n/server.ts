import "server-only";

import { cookies } from "next/headers";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  type AppLocale,
} from "@/lib/i18n/config";
import { resources } from "@/lib/i18n/resources";

type TranslationTree = typeof resources[typeof DEFAULT_LOCALE]["translation"];

function getValueByPath(tree: TranslationTree, key: string) {
  return key.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object" || !(segment in current)) {
      return undefined;
    }

    return (current as Record<string, unknown>)[segment];
  }, tree);
}

function interpolate(template: string, values?: Record<string, string | number>) {
  if (!values) {
    return template;
  }

  return template.replace(/\{\{(.*?)\}\}/g, (_, rawKey: string) => {
    const key = rawKey.trim();
    return String(values[key] ?? "");
  });
}

export function getTranslator(locale: AppLocale) {
  return (key: string, values?: Record<string, string | number>) => {
    const currentTree = resources[locale].translation;
    const fallbackTree = resources[DEFAULT_LOCALE].translation;

    const value = getValueByPath(currentTree, key) ?? getValueByPath(fallbackTree, key);

    if (typeof value !== "string") {
      return key;
    }

    return interpolate(value, values);
  };
}

export async function getRequestLocale() {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
}

export async function getServerTranslator(locale?: string) {
  const resolvedLocale = normalizeLocale(locale ?? (await getRequestLocale()));

  return {
    locale: resolvedLocale,
    t: getTranslator(resolvedLocale),
  };
}
