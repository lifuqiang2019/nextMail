"use client";

import { Badge, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { ShoppingCart, Store, User, LogOut, ShoppingBag } from "lucide-react";
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
          label: <Link href="/auth">登录</Link>,
        },
      ];

  return (
    <header className="bg-white shadow-sm" style={{ borderBottom: "2px solid #ff5000" }}>
      <div className="mx-auto max-w-7xl px-4 pb-3 pt-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link className="shrink-0" href="/">
            <div className="flex items-center gap-2">
              <Store size={24} style={{ color: "#ff5000" }} />
              <span className="text-lg font-bold text-gray-900">{storeName}</span>
            </div>
          </Link>

          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1 max-w-xl">
              <input
                className="tm-input"
                placeholder="搜索商品..."
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <button
                className="absolute right-0 top-0 flex h-full items-center rounded-r bg-orange-500 px-4 text-white transition hover:bg-orange-600"
                type="button"
              >
                搜索
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <button className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-500" type="button">
                <User size={16} />
                <span className="hidden sm:inline">{currentUser ? currentUser.name : "登录"}</span>
              </button>
            </Dropdown>

            <button
              className="relative flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-orange-300 hover:text-orange-500"
              onClick={toggleCart}
              type="button"
            >
              <Badge count={itemCount} offset={[4, -4]} overflowCount={99} size="small">
                <ShoppingCart size={18} />
              </Badge>
              <span className="hidden sm:inline">购物车</span>
              {subtotal > 0 && (
                <span className="ml-1 text-xs font-bold text-red-500">{formatCurrency(subtotal)}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-2 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-6 overflow-x-auto text-sm">
          <Link
            className={`shrink-0 whitespace-nowrap pb-1 font-medium transition ${
              pathname === "/" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-600 hover:text-orange-500"
            }`}
            href="/"
          >
            首页
          </Link>
          <Link
            className={`shrink-0 whitespace-nowrap pb-1 font-medium transition ${
              pathname === "/cart" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-600 hover:text-orange-500"
            }`}
            href="/cart"
          >
            购物车
          </Link>
          <Link
            className={`shrink-0 whitespace-nowrap pb-1 font-medium transition ${
              pathname === "/account" ? "border-b-2 border-orange-500 text-orange-500" : "text-gray-600 hover:text-orange-500"
            }`}
            href="/account"
          >
            账号中心
          </Link>
          <Link
            className="shrink-0 whitespace-nowrap pb-1 font-medium text-gray-400 transition hover:text-orange-500"
            href="/admin"
            target="_blank"
          >
            商家后台 {">"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
