"use client";

import { Badge, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { LogOut, Search, ShoppingBag, ShoppingCart, Store, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import type { CustomerProfile } from "@/types/store";

export function SiteHeader({
  storeName,
  currentUser,
  isMobile,
}: {
  storeName: string;
  currentUser: CustomerProfile | null;
  isMobile: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, toggleCart } = useCart();
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

  if (isMobile) {
    return (
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-screen-sm flex-col gap-3 px-3 pb-3 pt-3">
          <div className="flex items-center justify-between gap-3">
            <Link className="min-w-0 flex-1" href="/">
              <div className="flex items-center gap-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff1eb]">
                  <Store className="h-6 w-6 text-[#ff5a1f]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xl font-bold tracking-tight text-gray-900">{storeName}</p>
                  <p className="text-xs text-gray-400">潮流球鞋与穿搭精选</p>
                </div>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <button
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-700"
                  type="button"
                >
                  <User size={18} />
                </button>
              </Dropdown>
              <button
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-700"
                onClick={toggleCart}
                type="button"
              >
                <Badge count={itemCount} offset={[0, 2]} size="small">
                  <ShoppingCart size={18} />
                </Badge>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-[#ffd3c2] bg-[#fffaf8] p-1 shadow-[0_6px_18px_rgba(255,90,31,0.08)]">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-white px-3 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-gray-400" />
              <input
                className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                placeholder="搜索商品、品牌、风格"
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <button
              className="flex min-w-[68px] items-center justify-center rounded-xl bg-gradient-to-r from-[#ff7a1a] to-[#ff5a1f] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(255,90,31,0.22)]"
              type="button"
            >
              搜索
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white">
      <div className="border-b border-[#ececec] bg-[#fafafa] text-xs text-gray-500">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {currentUser ? (
              <span>
                Hi，<span className="font-medium text-gray-800">{currentUser.name}</span>
                <button className="ml-3 hover:text-[#ff5000]" onClick={logout} type="button">
                  退出
                </button>
              </span>
            ) : (
              <span>
                欢迎来到 {storeName}
                <Link className="ml-3 hover:text-[#ff5000]" href="/auth">
                  请登录
                </Link>
                <Link className="ml-3 hover:text-[#ff5000]" href="/auth?tab=register">
                  免费注册
                </Link>
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Link className="hover:text-[#ff5000]" href="/account">
              我的账号
            </Link>
            <Link className="hover:text-[#ff5000]" href="/cart">
              购物车 {itemCount > 0 ? <span className="font-bold text-[#ff5000]">{itemCount}</span> : null}
            </Link>
            <span className="text-gray-300">|</span>
            <Link className="hover:text-[#ff5000]" href="/admin" target="_blank">
              商家后台
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-[220px_minmax(0,1fr)_180px] items-center gap-8 px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[#fff1eb]">
              <Store className="h-8 w-8 text-[#ff5a1f]" />
            </div>
            <div>
              <p className="text-[32px] font-bold leading-none tracking-tight text-gray-900">{storeName}</p>
              <p className="mt-1 text-sm text-gray-400">精选鞋款 · 服饰 · 潮流搭配</p>
            </div>
          </div>
        </Link>

        <div className="min-w-0">
          <div className="flex items-center gap-3 rounded-[28px] border-2 border-[#ff5a1f] bg-white p-1 shadow-[0_14px_30px_rgba(255,90,31,0.08)]">
            <div className="flex flex-1 items-center gap-3 rounded-[22px] px-4 py-3">
              <Search className="h-5 w-5 shrink-0 text-gray-400" />
              <input
                className="w-full bg-transparent text-base text-gray-800 outline-none placeholder:text-gray-400"
                placeholder="搜索商品、品牌、系列、关键词"
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>
            <button
              className="flex min-w-[112px] items-center justify-center rounded-[22px] bg-gradient-to-r from-[#ff7a1a] to-[#ff5a1f] px-7 py-3 text-base font-semibold text-white"
              type="button"
            >
              搜索
            </button>
          </div>
          <div className="mt-3 flex items-center gap-4 text-sm text-gray-400">
            <span className="text-[#ff5a1f]">热门搜索</span>
            <span>Nike</span>
            <span>Air Jordan</span>
            <span>卫衣</span>
            <span>跑鞋</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-6">
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <button className="flex flex-col items-center gap-1 text-gray-600 transition hover:text-[#ff5000]" type="button">
              <User size={24} />
              <span className="max-w-[72px] truncate text-xs">{currentUser ? currentUser.name : "未登录"}</span>
            </button>
          </Dropdown>

          <button
            className="relative flex flex-col items-center gap-1 text-gray-600 transition hover:text-[#ff5000]"
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

      <div className="border-b-2 border-[#ff5a1f] bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-8 px-4 sm:px-6 lg:px-8">
          <div className="flex h-12 w-52 items-center justify-center rounded-t-2xl bg-[#ff5a1f] text-base font-semibold text-white">
            全部商品分类
          </div>
          <nav className="flex h-12 items-center gap-8 text-base">
            <Link
              className={pathname === "/" ? "font-semibold text-[#ff5a1f]" : "text-gray-700 hover:text-[#ff5a1f]"}
              href="/"
            >
              首页
            </Link>
            <Link
              className={pathname === "/account" ? "font-semibold text-[#ff5a1f]" : "text-gray-700 hover:text-[#ff5a1f]"}
              href="/account"
            >
              个人中心
            </Link>
            <Link
              className={pathname === "/orders" ? "font-semibold text-[#ff5a1f]" : "text-gray-700 hover:text-[#ff5a1f]"}
              href="/orders"
            >
              我的订单
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
