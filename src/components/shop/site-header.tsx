"use client";

import { Badge, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { LogOut, Search, ShoppingBag, ShoppingCart, Store, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";

import { useCart } from "@/components/cart/cart-provider";
import { LanguageSwitcher } from "@/components/shop/language-switcher";
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
  const { t } = useTranslation();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { itemCount, toggleCart } = useCart();
  const [loggingOut, setLoggingOut] = useState(false);
  const hasHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isCartPage = pathname === "/cart";
  const queryFromUrl = searchParams?.get("query") ?? "";

  const submitSearch = () => {
    const keyword = (searchInputRef.current?.value ?? queryFromUrl).trim();
    const href = keyword ? `/?query=${encodeURIComponent(keyword)}` : "/";
    router.push(href);
  };

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
          label: <Link href="/account">{t("header.accountCenter")}</Link>,
        },
        {
          key: "orders",
          icon: <ShoppingBag size={14} />,
          label: <Link href="/orders">{t("header.myOrders")}</Link>,
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
              {loggingOut ? t("header.logoutLoading") : t("common.logout")}
            </button>
          ),
        },
      ]
    : [
        {
          key: "login",
          icon: <User size={14} />,
          label: <Link href="/auth">{t("header.pleaseLogin")}</Link>,
        },
      ];

  if (isMobile) {
    const hideSearch = ["/cart", "/auth", "/account", "/orders"].includes(pathname);

    return (
      <header className="site-header">
        <div className={`site-header__inner tm-shell${!hideSearch ? "" : " site-header--compact"}`}>
          <div className="flex items-center justify-between gap-3">
            <Link className="header-brand flex-1 justify-start" href="/">
              <div className="header-brand__logo">
                <Store />
              </div>
              <div className="header-brand__info">
                <p className="header-brand__name">{storeName}</p>
                {!hideSearch ? <p className="header-brand__slogan">{t("header.mobileSlogan")}</p> : null}
              </div>
            </Link>
            <LanguageSwitcher compact />
          </div>

          {!hideSearch && (
            <div className="header-search">
              <div className="header-search__input-wrapper">
                <Search className="header-search__icon" />
                <input
                  className="header-search__input"
                  placeholder={t("header.searchPlaceholderMobile")}
                  type="text"
                  defaultValue={queryFromUrl}
                  key={queryFromUrl}
                  ref={searchInputRef}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      submitSearch();
                    }
                  }}
                />
              </div>
              <button
                className="header-search__btn"
                onClick={submitSearch}
                type="button"
              >
                {t("common.search")}
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
            <p className="site-header--desktop__slogan">{t("header.desktopSlogan")}</p>
          </div>
        </Link>

        <nav className="site-header--desktop__nav">
          <Link
            className={`site-header--desktop__nav-link${pathname === "/" ? " site-header--desktop__nav-link--active" : ""}`}
            href="/"
          >
            {t("common.home")}
          </Link>
          <Link
            className={`site-header--desktop__nav-link${pathname === "/account" ? " site-header--desktop__nav-link--active" : ""}`}
            href="/account"
          >
            {t("common.account")}
          </Link>
          <Link
            className={`site-header--desktop__nav-link${pathname === "/orders" ? " site-header--desktop__nav-link--active" : ""}`}
            href="/orders"
          >
            {t("common.orders")}
          </Link>
          <Link
            className={`site-header--desktop__nav-link${pathname === "/cart" ? " site-header--desktop__nav-link--active" : ""}`}
            href="/cart"
          >
            {t("common.cart")}
          </Link>
        </nav>

        <div className="site-header--desktop__search">
          <Search className="site-header--desktop__search-icon" strokeWidth={1.8} />
          <input
            className="site-header--desktop__search-input"
            placeholder={t("header.searchPlaceholderDesktop")}
            type="text"
            defaultValue={queryFromUrl}
            key={queryFromUrl}
            ref={searchInputRef}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                submitSearch();
              }
            }}
          />
          <button className="site-header--desktop__search-btn" onClick={submitSearch} type="button">
            {t("common.search")}
          </button>
        </div>

        <div className="site-header--desktop__actions">
          <LanguageSwitcher />
          <button
            aria-disabled={isCartPage}
            className={`site-header--desktop__cart-btn${isCartPage ? " site-header--desktop__cart-btn--disabled" : ""}`}
            onClick={isCartPage ? undefined : toggleCart}
            type="button"
          >
            <Badge
              count={hasHydrated ? itemCount : 0}
              offset={[4, -2]}
              size="small"
              className="[&_.ant-badge-count]:bg-[#ff3b3b]"
            >
              <ShoppingCart size={20} strokeWidth={1.7} />
            </Badge>
          </button>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
            <button className="site-header--desktop__user-btn" type="button">
              <User size={18} strokeWidth={1.8} />
              <span>{currentUser ? currentUser.name : t("common.login")}</span>
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}
