import { Suspense } from "react";

import { AppProviders } from "@/components/providers/app-providers";
import { BottomNav } from "@/components/shop/bottom-nav";
import { SiteHeader } from "@/components/shop/site-header";
import { getCurrentCustomerProfile } from "@/lib/auth/customer";
import { detectIsMobile } from "@/lib/device";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [store, currentUser, isMobile] = await Promise.all([
    readStoreData(),
    getCurrentCustomerProfile(),
    detectIsMobile(),
  ]);

  return (
    <AppProviders>
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
                <h4 className="font-bold text-gray-900">关于我们</h4>
                <p className="mt-3 text-sm leading-7 text-gray-500">
                  专注潮流鞋款与服饰，覆盖多个国际品牌，提供便捷的在线购买体验。
                </p>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">客户服务</h4>
                <div className="mt-3 space-y-2 text-sm text-gray-500">
                  <p>客服邮箱：{store.settings.supportEmail || "support@example.com"}</p>
                  <p>服务电话：{store.settings.supportPhone || "400-000-0000"}</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">购物帮助</h4>
                <div className="mt-3 space-y-2 text-sm text-gray-500">
                  <p>如何购买</p>
                  <p>配送说明</p>
                  <p>退换政策</p>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-gray-900">关注我们</h4>
                <div className="mt-3 space-y-2 text-sm text-gray-500">
                  <p>官方微信</p>
                  <p>官方微博</p>
                  <p>{store.settings.storeName}</p>
                </div>
              </div>
            </div>
            <div className="site-footer--desktop__copy">
              <p>© 2026 {store.settings.storeName} 版权所有</p>
            </div>
          </div>
        </footer>
      )}
      {isMobile ? <BottomNav /> : null}
    </AppProviders>
  );
}

