"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, User } from "lucide-react";
import { Badge } from "antd";
import { useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";

import { useCart } from "@/components/cart/cart-provider";

export function BottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { itemCount } = useCart();
  const hasHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const navItems = [
    { name: t("common.home"), href: "/", icon: Home },
    { name: t("common.cart"), href: "/cart", icon: ShoppingCart, badge: hasHydrated ? itemCount : 0 },
    { name: t("common.me"), href: "/account", icon: User },
  ];

  return (
    <div className="bottom-nav md:hidden">
      <nav className="bottom-nav__inner tm-shell">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const iconColor = isActive ? "#ff6b35" : "#bbb";

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${isActive ? " nav-item--active" : ""}`}
            >
              <div className="nav-item__icon">
                {item.badge ? (
                  <Badge count={item.badge} size="small" offset={[4, -2]}>
                    <item.icon size={23} strokeWidth={1.9} color={iconColor} />
                  </Badge>
                ) : (
                  <item.icon size={23} strokeWidth={1.9} color={iconColor} />
                )}
              </div>
              <span className="nav-item__label">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
