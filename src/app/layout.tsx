import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";

import "./globals.css";

export const metadata: Metadata = {
  title: "ShoeMall Pro - 潮流球鞋商城",
  description: "覆盖篮球鞋、复古跑鞋与潮流穿搭，支持前台登录与后台管理。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="min-h-full bg-[#f6f7fb] text-gray-800">
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
