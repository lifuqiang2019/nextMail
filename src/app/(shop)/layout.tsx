import { Suspense } from "react";

import { AppProviders } from "@/components/providers/app-providers";
import { BottomNav } from "@/components/shop/bottom-nav";
import { SiteHeader } from "@/components/shop/site-header";
import { getCurrentCustomerProfile } from "@/lib/auth/customer";
import { detectIsMobile } from "@/lib/device";
import { getServerTranslator } from "@/lib/i18n/server";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, t } = await getServerTranslator();
  const [store, currentUser, isMobile] = await Promise.all([
    readStoreData(),
    getCurrentCustomerProfile(),
    detectIsMobile(),
  ]);

  return (
    <AppProviders initialLocale={locale}>
      <Suspense fallback={<div className="h-14 w-full bg-white border-b border-[#f0f0f0]" />}>
        <SiteHeader currentUser={currentUser} isMobile={isMobile} storeName={store.settings.storeName} />
      </Suspense>
      <main className={isMobile ? "pb-20" : "main--desktop"}>{children}</main>
      {isMobile ? (
        <footer className="tm-shell pb-24 pt-10 text-center text-xs text-gray-400">
          <p>© 2026 {store.settings.storeName}</p>
        </footer>
      ) : (
        <footer className="site-footer--desktop">
          <div className="tm-shell site-footer--desktop__inner">
            <div className="site-footer--desktop__grid">
              <div>
                <h4 className="font-bold text-gray-900">{t("footer.aboutUs")}</h4>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  {t("footer.aboutDesc")}
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{t("footer.customerService")}</h4>
                <div className="mt-3 space-y-2 text-sm text-gray-500">
                  <p>
                    {t("footer.supportEmail", {
                      value: store.settings.supportEmail || "support@example.com",
                    })}
                  </p>
                  <p>
                    {t("footer.supportPhone", {
                      value: store.settings.supportPhone || "400-000-0000",
                    })}
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{t("footer.shoppingHelp")}</h4>
                <div className="mt-3 space-y-2 text-sm text-gray-500">
                  <p>{t("footer.howToBuy")}</p>
                  <p>{t("footer.shippingInfo")}</p>
                  <p>{t("footer.returnPolicy")}</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{t("footer.followUs")}</h4>
                <div className="mt-3 space-y-2 text-sm text-gray-500">
                  <p>{t("footer.wechat")}</p>
                  <p>{t("footer.weibo")}</p>
                  <p>{store.settings.storeName}</p>
                </div>
              </div>
            </div>
            <div className="site-footer--desktop__copy">
              <p>{t("footer.copyright", { storeName: store.settings.storeName })}</p>
            </div>
          </div>
        </footer>
      )}
      {isMobile ? <BottomNav /> : null}
    </AppProviders>
  );
}
