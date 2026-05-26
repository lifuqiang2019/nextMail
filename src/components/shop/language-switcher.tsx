"use client";

import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useLocale } from "@/components/providers/locale-provider";
import {
  type AppLocale,
  getLocaleLabel,
  getLocaleShortLabel,
  SUPPORTED_LOCALES,
} from "@/lib/i18n/config";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLocale();
  const { t } = useTranslation();
  const currentLabel = getLocaleShortLabel(locale);
  const currentFullLabel =
    locale === "zh-CN"
      ? t("locale.zh", { defaultValue: getLocaleLabel(locale) })
      : t("locale.en", { defaultValue: getLocaleLabel(locale) });

  const localeMenuItems: MenuProps["items"] = SUPPORTED_LOCALES.map((option) => {
    const translatedLabel =
      option === "zh-CN"
        ? t("locale.zh", { defaultValue: getLocaleLabel(option) })
        : t("locale.en", { defaultValue: getLocaleLabel(option) });

    return {
      key: option,
      label: translatedLabel,
    };
  });

  return (
    <Dropdown
      classNames={{
        root: `locale-switcher__menu${compact ? " locale-switcher__menu--compact" : ""}`,
      }}
      menu={{
        items: localeMenuItems,
        onClick: ({ key }) => setLocale(key as AppLocale),
        selectable: true,
        selectedKeys: [locale],
      }}
      placement="bottomRight"
      trigger={["click"]}
    >
      <button
        aria-haspopup="menu"
        aria-label={currentFullLabel}
        className={`locale-switcher${compact ? " locale-switcher--compact" : ""}`}
        title={currentFullLabel}
        type="button"
      >
        <span className="locale-switcher__value">{currentLabel}</span>
        <ChevronDown className="locale-switcher__caret" size={12} strokeWidth={2.2} />
      </button>
    </Dropdown>
  );
}
