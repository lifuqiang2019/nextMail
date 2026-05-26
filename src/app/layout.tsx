import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";

import { getRequestLocale } from "@/lib/i18n/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShoeMall Pro",
  description: "Trendy sneaker storefront with customer checkout and admin management.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getRequestLocale();

  return (
    <html lang={locale} className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full bg-[#f6f7fb] text-gray-800">
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
