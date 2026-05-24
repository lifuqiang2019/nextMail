"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Badge } from "antd";

export function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  const navItems = [
    { name: "首页", href: "/", icon: Home },
    { name: "购物车", href: "/cart", icon: ShoppingCart, badge: itemCount },
    { name: "我的", href: "/account", icon: User },
  ];

  return (
    <div className="bottom-nav md:hidden">
      <nav className="bottom-nav__inner tm-shell">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const iconColor = isActive ? '#ff6b35' : '#bbb';
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${isActive ? ' nav-item--active' : ''}`}
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
