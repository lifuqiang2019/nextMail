import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";

import { AppProviders } from "@/components/providers/app-providers";
import { CartSidebar } from "@/components/cart/cart-sidebar";
import { SiteHeader } from "@/components/shop/site-header";
import { BottomNav } from "@/components/shop/bottom-nav";
import { getCurrentCustomerProfile } from "@/lib/auth/customer";
import { detectIsMobile } from "@/lib/device";
import { readStoreData } from "@/lib/store";

import "./globals.css";

export const metadata: Metadata = {
  title: "ShoeMall Pro - 潮流球鞋商城",
  description: "覆盖篮球鞋、复古跑鞋与潮流穿搭，支持前台登录与后台管理。",
};

export default async function RootLayout({
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
    <html lang="zh-CN" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full bg-[#f6f7fb] text-gray-800">
        <AntdRegistry>
          <AppProviders>
            <SiteHeader currentUser={currentUser} isMobile={isMobile} storeName={store.settings.storeName} />
            <main className={isMobile ? "pb-20" : ""}>{children}</main>
            {isMobile ? (
              <footer className="px-4 pb-24 pt-8 text-center text-xs text-gray-400">
                <p>© 2026 {store.settings.storeName}</p>
              </footer>
            ) : (
              <footer className="mt-12 border-t border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <h4 className="font-bold text-gray-900">关于我们</h4>
                      <p className="mt-3 text-sm leading-7 text-gray-500">专注潮流鞋款与服饰，覆盖多个国际品牌，提供便捷的在线购买体验。</p>
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
                  <div className="mt-8 border-t border-gray-100 pt-6 text-center text-sm text-gray-400">
                    <p>© 2026 {store.settings.storeName} 版权所有</p>
                  </div>
                </div>
              </footer>
            )}
            {isMobile ? <BottomNav /> : null}
            <CartSidebar />
          </AppProviders>
        </AntdRegistry>
      </body>
    </html>
  );
}
