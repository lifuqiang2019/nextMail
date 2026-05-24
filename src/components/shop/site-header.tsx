"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import type { CustomerProfile } from "@/types/store";

function linkClass(active: boolean) {
  return active
    ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
    : "rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900";
}

export function SiteHeader({
  storeName,
  currentUser,
}: {
  storeName: string;
  currentUser: CustomerProfile | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, toggleCart } = useCart();
  const [loggingOut, setLoggingOut] = useState(false);

  const logout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    setLoggingOut(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link className="text-lg font-semibold text-slate-950" href="/">
            {storeName}
          </Link>
          <p className="text-sm text-slate-500">真实鞋商城数据 + 前后台一体化</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link className={linkClass(pathname === "/")} href="/">
            商城首页
          </Link>
          <Link className={linkClass(pathname === "/cart")} href="/cart">
            购物车
          </Link>
          <Link className={linkClass(pathname === "/account")} href="/account">
            账号中心
          </Link>
          <Link className={linkClass(pathname.startsWith("/admin"))} href="/admin">
            后台系统
          </Link>
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            onClick={toggleCart}
            type="button"
          >
            购物车 ({itemCount})
          </button>
          {currentUser ? (
            <>
              <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                {currentUser.name}
              </span>
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 disabled:opacity-60"
                disabled={loggingOut}
                onClick={logout}
                type="button"
              >
                {loggingOut ? "退出中..." : "退出"}
              </button>
            </>
          ) : (
            <Link className="rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white" href="/auth">
              登录 / 注册
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
