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
    <header className="site-header site-header--desktop">
      <div className="tm-shell site-header--desktop__bar">
        <Link className="site-header--desktop__brand" href="/">
          <div className="site-header--desktop__logo">
            <Store strokeWidth={1.8} />
          </div>
          <div>
            <p className="site-header--desktop__name">{storeName}</p>
            <p className="site-header--desktop__slogan">精选鞋款 · 服饰 · 潮流搭配</p>
          </div>
        </Link>

        <nav className="site-header--desktop__nav">
          <Link
            className={`site-header--desktop__nav-link${pathname === "/" ? " site-header--desktop__nav-link--active" : ""}`}
            href="/"
          >
            首页
          </Link>
          <Link
            className={`site-header--desktop__nav-link${pathname === "/account" ? " site-header--desktop__nav-link--active" : ""}`}
            href="/account"
          >
            个人中心
          </Link>
          <Link
            className={`site-header--desktop__nav-link${pathname === "/orders" ? " site-header--desktop__nav-link--active" : ""}`}
            href="/orders"
          >
            我的订单
          </Link>
          <Link
            className={`site-header--desktop__nav-link${pathname === "/cart" ? " site-header--desktop__nav-link--active" : ""}`}
            href="/cart"
          >
            购物车
          </Link>
        </nav>

        <div className="site-header--desktop__search">
          <Search className="site-header--desktop__search-icon" strokeWidth={1.8} />
          <input
            className="site-header--desktop__search-input"
            placeholder="搜索商品、品牌、系列、关键词"
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button className="site-header--desktop__search-btn" type="button">
            搜索
          </button>
        </div>

        <div className="site-header--desktop__actions">
          <button
            className="site-header--desktop__cart-btn"
            onClick={toggleCart}
            type="button"
          >
            <Badge count={itemCount} offset={[4, -2]} size="small" className="[&_.ant-badge-count]:bg-[#ff3b3b]">
              <ShoppingCart size={20} strokeWidth={1.7} />
            </Badge>
          </button>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
            <button className="site-header--desktop__user-btn" type="button">
              <User size={18} strokeWidth={1.8} />
              <span>{currentUser ? currentUser.name : "登录"}</span>
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
