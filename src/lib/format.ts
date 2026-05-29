import { normalizeLocale } from "@/lib/i18n/config";

export function formatCurrency(value: number, locale?: string) {
  const roundedValue = Number.isFinite(value) ? value : 0;
  const formattedNumber = new Intl.NumberFormat(normalizeLocale(locale), {
    maximumFractionDigits: 0,
  }).format(roundedValue);

  return `$${formattedNumber}`;
}

export function formatDate(value: string | Date, locale?: string) {
  return new Intl.DateTimeFormat(normalizeLocale(locale)).format(new Date(value));
}

export function formatDateTime(value: string | Date, locale?: string) {
  return new Intl.DateTimeFormat(normalizeLocale(locale), {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));
}
