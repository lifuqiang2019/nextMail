"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useCart } from "@/components/cart/cart-provider";

function linkClass(active: boolean) {
  return active
    ? "rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
    : "rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900";
}

export function SiteHeader({ storeName }: { storeName: string }) {
  const pathname = usePathname();
  const { itemCount, toggleCart } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link className="text-lg font-semibold text-slate-950" href="/">
            {storeName}
          </Link>
          <p className="text-sm text-slate-500">前台商城与后台配置一体化</p>
        </div>

        <div className="flex items-center gap-2">
          <Link className={linkClass(pathname === "/")} href="/">
            商城首页
          </Link>
          <Link className={linkClass(pathname === "/admin")} href="/admin">
            后台配置
          </Link>
          <Link className={linkClass(pathname === "/cart")} href="/cart">
            结算页
          </Link>
          <button
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            onClick={toggleCart}
            type="button"
          >
            购物车 ({itemCount})
          </button>
        </div>
      </div>
    </header>
  );
}
