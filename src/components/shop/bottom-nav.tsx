"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { Badge } from "antd";

export function BottomNav() {
  const pathname = usePathname();
  const { itemCount } = useCart();

  const navItems = [
    { name: "首页", href: "/", icon: Home },
    { name: "分类", href: "/#categories", icon: LayoutGrid },
    { name: "购物车", href: "/cart", icon: ShoppingCart, badge: itemCount },
    { name: "我的", href: "/account", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <nav className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-orange-500" : "text-gray-500 hover:text-orange-500"
              }`}
            >
              <div className="relative">
                {item.badge ? (
                  <Badge count={item.badge} size="small" offset={[4, -4]}>
                    <item.icon size={22} className={isActive ? "text-orange-500" : ""} />
                  </Badge>
                ) : (
                  <item.icon size={22} className={isActive ? "text-orange-500" : ""} />
                )}
              </div>
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
