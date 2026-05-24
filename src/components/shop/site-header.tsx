"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { useAuth } from "@/components/providers/auth-provider";

const navLinks = [
  { href: "/", label: "商城首页" },
  { href: "/admin", label: "后台配置" },
  { href: "/cart", label: "结算页" },
  { href: "/orders", label: "我的订单" },
] as const;

function linkClass(active: boolean) {
  return active
    ? "inline-flex items-center justify-center rounded-full !bg-slate-950 px-4 py-2 text-sm font-medium !text-white shadow-sm whitespace-nowrap"
    : "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 whitespace-nowrap";
}

export function SiteHeader({ storeName }: { storeName: string }) {
  const pathname = usePathname();
  const { itemCount, toggleCart } = useCart();
  const { isLoading, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link className="line-clamp-1 text-base font-semibold text-slate-950 sm:text-lg" href="/">
              {storeName}
            </Link>
            <p className="mt-1 max-w-[14rem] text-xs text-slate-500 sm:max-w-none sm:text-sm">
              前台商城与后台配置一体化
            </p>
          </div>
          <button
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "关闭导航菜单" : "打开导航菜单"}
            className="shrink-0 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 md:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            type="button"
          >
            {isMenuOpen ? "关闭" : "菜单"}
          </button>
        </div>

        <div className="hidden flex-col gap-3 md:flex lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <div className="flex min-w-max items-center gap-2">
              {navLinks.map((link) => (
                <Link className={linkClass(pathname === link.href)} href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium whitespace-nowrap text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                onClick={toggleCart}
                type="button"
              >
                购物车 ({itemCount})
              </button>
            </div>
          </div>

          <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {isLoading ? (
              <span className="text-sm text-slate-500">正在读取登录状态...</span>
            ) : user ? (
              <>
                <span className="text-sm text-slate-600">
                  已登录: <span className="font-medium text-slate-950">{user.name}</span>
                </span>
                <button
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium whitespace-nowrap text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                  onClick={logout}
                  type="button"
                >
                  退出登录
                </button>
              </>
            ) : (
              <Link className={linkClass(pathname === "/login")} href="/login">
                邮箱登录 / 注册
              </Link>
            )}
          </div>
        </div>

        {isMenuOpen ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-3 shadow-sm md:hidden sm:p-4">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  className={`${linkClass(pathname === link.href)} w-full`}
                  href={link.href}
                  key={link.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <button
                className="w-full rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                onClick={() => {
                  toggleCart();
                  setIsMenuOpen(false);
                }}
                type="button"
              >
                购物车 ({itemCount})
              </button>
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              {isLoading ? (
                <span className="text-sm text-slate-500">正在读取登录状态...</span>
              ) : user ? (
                <div className="flex flex-col gap-3 rounded-3xl bg-slate-50 p-4">
                  <span className="text-sm text-slate-600">
                    已登录: <span className="font-medium text-slate-950">{user.name}</span>
                  </span>
                  <button
                    className="w-full rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    type="button"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <Link
                  className={`${linkClass(pathname === "/login")} w-full`}
                  href="/login"
                  onClick={() => setIsMenuOpen(false)}
                >
                  邮箱登录 / 注册
                </Link>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
