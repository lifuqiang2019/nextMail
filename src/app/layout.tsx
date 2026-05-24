import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/shop/site-header";
import { readStoreData } from "@/lib/store";

import "./globals.css";

export const metadata: Metadata = {
  title: "NextMail Mall",
  description: "基于 Next.js 构建的电商前后台一体化项目。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const store = await readStoreData();

  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full bg-slate-50 text-slate-950">
        <AppProviders>
          <SiteHeader storeName={store.settings.storeName} />
          <main>{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
