import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import { SiteHeader } from "@/components/shop/site-header";
import { readStoreData } from "@/lib/store";

import "./globals.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const store = await readStoreData();

  return {
    title: store.settings.storeName,
    description: store.settings.heroSubtitle,
  };
}

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
