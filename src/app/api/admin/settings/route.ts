import { NextResponse } from "next/server";

import { ensureAdminApiAccess } from "@/lib/admin/guards";
import { prisma } from "@/lib/prisma";
import { getRequestLocale } from "@/lib/i18n/server";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getFallbackStore } from "@/lib/store-defaults";

function isRecoverableStoreSettingError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const fullMessage = `${error.name}\n${error.message}\n${String((error as { cause?: unknown }).cause ?? "")}`;
  return /DriverAdapterError|pool timeout|max_connections_per_hour|failed to retrieve a connection|does not exist|doesn't exist|P2021/i.test(
    fullMessage,
  );
}

export async function PUT(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const locale = await getRequestLocale();
  const body = (await request.json()) as Record<string, unknown>;
  const fallback = getFallbackStore(locale);
  const defaultFallback = getFallbackStore(DEFAULT_LOCALE);

  const storeName = typeof body.storeName === "string" ? body.storeName.trim() : "";
  const supportEmail = typeof body.supportEmail === "string" ? body.supportEmail.trim() : "";
  const supportPhone = typeof body.supportPhone === "string" ? body.supportPhone.trim() : "";
  const orderLink = typeof body.orderLink === "string" ? body.orderLink.trim() : "";
  const paymentAccountName = typeof body.paymentAccountName === "string" ? body.paymentAccountName.trim() : "";
  const paymentAccountNumber = typeof body.paymentAccountNumber === "string" ? body.paymentAccountNumber.trim() : "";
  const paymentBankName = typeof body.paymentBankName === "string" ? body.paymentBankName.trim() : "";

  const baseSettings = {
    storeName: storeName || fallback.settings.storeName,
    supportEmail: supportEmail || fallback.settings.supportEmail,
    supportPhone: supportPhone || fallback.settings.supportPhone,
    orderLink: orderLink || fallback.settings.orderLink,
    paymentAccountName: paymentAccountName || fallback.settings.paymentAccountName || "",
    paymentAccountNumber: paymentAccountNumber || fallback.settings.paymentAccountNumber || "",
    paymentBankName: paymentBankName || fallback.settings.paymentBankName || "",
  };

  const heroTitle = typeof body.heroTitle === "string" ? body.heroTitle.trim() : "";
  const heroSubtitle = typeof body.heroSubtitle === "string" ? body.heroSubtitle.trim() : "";
  const heroNotice = typeof body.heroNotice === "string" ? body.heroNotice.trim() : "";
  const purchaseGuide = typeof body.purchaseGuide === "string" ? body.purchaseGuide.trim() : "";

  const localizedSettings = {
    heroTitle: heroTitle || fallback.settings.heroTitle,
    heroSubtitle: heroSubtitle || fallback.settings.heroSubtitle,
    heroNotice: heroNotice || fallback.settings.heroNotice,
    purchaseGuide: purchaseGuide || fallback.settings.purchaseGuide,
  };

  const settings = await prisma.storeSetting.upsert({
    where: { id: 1 },
    update: locale === DEFAULT_LOCALE ? { ...baseSettings, ...localizedSettings } : baseSettings,
    create: {
      id: 1,
      ...baseSettings,
      heroTitle: defaultFallback.settings.heroTitle,
      heroSubtitle: defaultFallback.settings.heroSubtitle,
      heroNotice: defaultFallback.settings.heroNotice,
      purchaseGuide: defaultFallback.settings.purchaseGuide,
    },
  });

  const storeSettingI18n = (prisma as unknown as { storeSettingI18n?: { upsert: (args: unknown) => Promise<unknown> } })
    .storeSettingI18n;
  if (storeSettingI18n) {
    try {
      await storeSettingI18n.upsert({
        where: { storeId_locale: { storeId: 1, locale } },
        update: localizedSettings,
        create: {
          storeId: 1,
          locale,
          ...localizedSettings,
        },
      });
    } catch (error) {
      if (!isRecoverableStoreSettingError(error)) {
        throw error;
      }
    }
  }

  return NextResponse.json(settings);
}
