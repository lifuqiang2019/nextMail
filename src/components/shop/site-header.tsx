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
    const hideSearch = ["/cart", "/auth", "/account", "/orders"].includes(pathname);
    
    return (
      <header className="site-header">
        <div className={`site-header__inner tm-shell${!hideSearch ? '' : ' site-header--compact'}`}>
          {/* Logo 和标题居中 */}
          <Link className="header-brand" href="/">
            <div className="header-brand__logo">
              <Store />
            </div>
            <div className="header-brand__info">
              <p className="header-brand__name">{storeName}</p>
              {!hideSearch && <p className="header-brand__slogan">潮流鞋款与穿搭精选</p>}
            </div>
          </Link>

          {/* 搜索框 - 仅在首页显示 */}
          {!hideSearch && (
            <div className="header-search">
              <div className="header-search__input-wrapper">
                <Search className="header-search__icon" />
                <input
                  className="header-search__input"
                  placeholder="搜索商品、品牌、风格"
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              <button
                className="header-search__btn"
                type="button"
              >
                搜索
              </button>
            </div>
          )}
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-[#e8e8e8] bg-white">
      {/* Logo 居中 + 购物车图标在右侧 */}
      <div className="tm-shell flex items-center justify-between py-5">
        <div className="w-[120px]" />
        
        <Link className="flex items-center justify-center gap-3" href="/">
          <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#fff1eb]">
            <Store className="h-6 w-6 text-[#ff6b35]" />
          </div>
          <div>
            <p className="text-[20px] font-semibold text-[#1a1a1a]">{storeName}</p>
            <p className="mt-0.5 text-sm text-[#8f8f8f]">精选鞋款 · 服饰 · 潮流搭配</p>
          </div>
        </Link>

        <div className="flex items-center justify-end gap-3 w-[120px]">
          <button
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#8f8f8f] transition hover:border-[#ffd8c8] hover:bg-[#fff1eb] hover:text-[#ff6b35]"
            onClick={toggleCart}
            type="button"
          >
            <Badge count={itemCount} offset={[4, -2]} size="small" className="[&_.ant-badge-count]:bg-[#ff3b3b]">
              <ShoppingCart size={20} strokeWidth={1.7} />
            </Badge>
          </button>
        </div>
      </div>

      {/* 搜索栏居中 */}
      <div className="border-t border-[#e8e8e8] bg-white">
        <div className="tm-shell flex items-center justify-center py-4">
          <div className="w-full max-w-[600px]">
            <div className="flex items-center gap-2 rounded-[12px] bg-[#fafafa] p-1.5">
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="h-5 w-5 shrink-0 text-[#8f8f8f]" />
                <input
                  className="w-full bg-transparent text-base text-[#1a1a1a] outline-none placeholder:text-[#b8b8b8]"
                  placeholder="搜索商品、品牌、系列、关键词"
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
              <button
                className="flex min-w-[100px] items-center justify-center rounded-[10px] bg-[#ff6b35] px-5 py-2.5 text-base font-medium text-white shadow-[0_2px_8px_rgba(255,107,53,0.25)] transition hover:translate-y-[-1px]"
                type="button"
              >
                搜索
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 导航栏 - 去掉"分类"，只保留首页、个人中心、我的订单 */}
      <div className="border-t border-[#e8e8e8] bg-white">
        <div className="tm-shell flex items-center justify-center gap-8">
          <nav className="flex h-[48px] items-center gap-7 text-[15px]">
            <Link
              className={pathname === "/" ? "font-semibold text-[#ff6b35]" : "text-[#4a4a4a] transition hover:text-[#ff6b35]"}
              href="/"
            >
              首页
            </Link>
            <Link
              className={pathname === "/account" ? "font-semibold text-[#ff6b35]" : "text-[#4a4a4a] transition hover:text-[#ff6b35]"}
              href="/account"
            >
              个人中心
            </Link>
            <Link
              className={pathname === "/orders" ? "font-semibold text-[#ff6b35]" : "text-[#4a4a4a] transition hover:text-[#ff6b35]"}
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
