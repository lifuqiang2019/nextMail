"use client";

import { Badge, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { ShoppingCart, Store, User, LogOut, ShoppingBag, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";
import type { CustomerProfile } from "@/types/store";

export function SiteHeader({
  storeName,
  currentUser,
}: {
  storeName: string;
  currentUser: CustomerProfile | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, toggleCart, subtotal } = useCart();
  const [searchValue, setSearchValue] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
    setLoggingOut(false);
  };

  const userMenuItems: MenuProps["items"] = currentUser
    ? [
        {
          key: "account",
          icon: <User size={14} />,
          label: <Link href="/account">账号中心</Link>,
        },
        {
          key: "orders",
          icon: <ShoppingBag size={14} />,
          label: <Link href="/orders">我的订单</Link>,
        },
        { type: "divider" },
        {
          key: "logout",
          icon: <LogOut size={14} />,
          label: (
            <button
              className="w-full text-left"
              disabled={loggingOut}
              onClick={logout}
              type="button"
            >
              {loggingOut ? "退出中..." : "退出登录"}
            </button>
          ),
        },
      ]
    : [
        {
          key: "login",
          icon: <User size={14} />,
          label: <Link href="/auth">请登录</Link>,
        },
      ];

  return (
    <header className="bg-white">
      {/* ================= PC 顶层小条 (Topbar) ================= */}
      <div className="hidden md:block bg-[#f5f5f5] border-b border-[#e8e8e8] text-xs text-gray-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-between h-8 items-center">
          <div className="flex items-center gap-4">
            {currentUser ? (
              <span>
                Hi, <span className="text-gray-800 font-medium">{currentUser.name}</span>
                <button onClick={logout} className="ml-3 hover:text-[#ff5000]">退出</button>
              </span>
            ) : (
              <span>
                欢迎来到 {storeName}！
                <Link href="/auth" className="ml-3 hover:text-[#ff5000]">请登录</Link>
                <Link href="/auth?tab=register" className="ml-3 hover:text-[#ff5000]">免费注册</Link>
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/account" className="hover:text-[#ff5000]">我的淘宝(账号)</Link>
            <Link href="/cart" className="hover:text-[#ff5000]">购物车 {itemCount > 0 && <span className="text-[#ff5000] font-bold">{itemCount}</span>}</Link>
            <span className="text-gray-300">|</span>
            <Link href="/admin" target="_blank" className="hover:text-[#ff5000]">商家后台</Link>
          </div>
        </div>
      </div>

      {/* ================= PC 主内容区 & 移动端顶部 ================= */}
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 lg:py-6">
        <div className="flex items-center justify-between gap-4 lg:gap-8">
          {/* Logo */}
          <Link className="shrink-0" href="/">
            <div className="flex items-center gap-2">
              <Store className="w-8 h-8 lg:w-10 lg:h-10" style={{ color: "#ff5000" }} />
              <span className="text-xl lg:text-3xl font-bold text-gray-900 tracking-tight">{storeName}</span>
            </div>
          </Link>

          {/* 搜索框 (PC & 移动通用) */}
          <div className="flex-1 max-w-2xl">
            <div className="relative flex items-center border-2 border-[#ff5000] rounded-full overflow-hidden h-10 lg:h-11">
              <div className="pl-4 text-gray-400">
                <Search size={18} />
              </div>
              <input
                className="w-full h-full px-3 outline-none text-sm"
                placeholder="搜索喜欢的商品..."
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button
                className="h-full px-6 lg:px-8 bg-gradient-to-r from-[#ff7700] to-[#ff5000] text-white font-bold text-sm lg:text-base hover:opacity-90 transition"
                type="button"
              >
                搜索
              </button>
            </div>
            {/* PC 热门搜索词 */}
            <div className="hidden lg:flex gap-3 mt-2 text-xs text-gray-400">
              <span className="text-[#ff5000] cursor-pointer hover:underline">Nike</span>
              <span className="cursor-pointer hover:underline">Air Jordan</span>
              <span className="cursor-pointer hover:underline">休闲鞋</span>
              <span className="cursor-pointer hover:underline">卫衣</span>
            </div>
          </div>

          {/* 右侧工具栏 (仅 PC 显示，移动端通过 BottomNav 替代) */}
          <div className="hidden md:flex items-center gap-6">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <button className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#ff5000] transition" type="button">
                <User size={24} />
                <span className="text-xs">{currentUser ? currentUser.name : "未登录"}</span>
              </button>
            </Dropdown>

            <button
              className="flex flex-col items-center gap-1 text-gray-600 hover:text-[#ff5000] transition relative"
              onClick={toggleCart}
              type="button"
            >
              <Badge count={itemCount} offset={[6, -2]} size="small">
                <ShoppingCart size={24} className={itemCount > 0 ? "text-[#ff5000]" : ""} />
              </Badge>
              <span className="text-xs">购物车</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= PC 主导航条 ================= */}
      <div className="hidden md:block border-b-2 border-[#ff5000]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-8">
            {/* 类似淘宝的全部分类按钮 */}
            <div className="bg-[#ff5000] text-white px-6 py-2.5 font-bold flex items-center gap-2 w-48 justify-center cursor-pointer">
              商品分类
            </div>
            <Link
              className={`font-medium pb-2.5 pt-2.5 px-2 transition border-b-2 ${
                pathname === "/" ? "border-[#ff5000] text-[#ff5000]" : "border-transparent text-gray-800 hover:text-[#ff5000]"
              }`}
              href="/"
            >
              首页
            </Link>
            <Link
              className={`font-medium pb-2.5 pt-2.5 px-2 transition border-b-2 ${
                pathname === "/account" ? "border-[#ff5000] text-[#ff5000]" : "border-transparent text-gray-800 hover:text-[#ff5000]"
              }`}
              href="/account"
            >
              个人中心
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
