import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";

import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/shop/site-header";
import { getCurrentCustomerProfile } from "@/lib/auth/customer";
import { readStoreData } from "@/lib/store";

import "./globals.css";

export const metadata: Metadata = {
  title: "ShoeMall Pro",
  description: "基于 Next.js 与 Prisma 构建的鞋商城前后台一体化项目。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [store, currentUser] = await Promise.all([
    readStoreData(),
    getCurrentCustomerProfile(),
  ]);

  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-950">
        <AntdRegistry>
          <AppProviders>
            <SiteHeader currentUser={currentUser} storeName={store.settings.storeName} />
            <main>{children}</main>
          </AppProviders>
        </AntdRegistry>
      </body>
    </html>
  );
}
