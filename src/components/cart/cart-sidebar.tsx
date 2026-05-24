"use client";

import { Drawer } from "antd";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";

export function CartSidebar() {
  const { isOpen, closeCart, items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const router = useRouter();

  const goCheckout = () => {
    closeCart();
    router.push("/cart");
  };

  return (
    <Drawer
      title={
        <div className="flex items-center gap-2">
          <ShoppingCart size={20} style={{ color: "#ff5000" }} />
          <span className="text-base font-semibold">我的购物车</span>
          {items.length > 0 && (
            <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">
              {items.reduce((s, i) => s + i.quantity, 0)}
            </span>
          )}
        </div>
      }
      onClose={closeCart}
      open={isOpen}
      size="default"
      footer={
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">合计（不含运费）</span>
            <span className="text-xl font-bold text-red-500">{formatCurrency(subtotal)}</span>
          </div>
          <button
            className="tm-btn-primary w-full py-3 text-base"
            disabled={items.length === 0}
            onClick={goCheckout}
            type="button"
          >
            去结算
          </button>
        </div>
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <ShoppingCart size={56} strokeWidth={1} />
          <p className="mt-4 text-base">购物车是空的</p>
          <button
            className="mt-4 rounded-full border border-orange-400 px-6 py-2 text-sm font-medium text-orange-500 transition hover:border-orange-500 hover:bg-orange-50"
            onClick={closeCart}
            type="button"
          >
            继续逛逛
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {items.map((item) => (
            <div className="flex gap-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm" key={item.id}>
              <div
                className="h-16 w-16 shrink-0 rounded-lg bg-cover bg-center"
                style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : "linear-gradient(135deg, #f0f0f0, #e0e0e0)" }}
              />
              <div className="flex flex-1 flex-col justify-between overflow-hidden">
                <p className="truncate text-sm font-medium">{item.name}</p>
                <p className="mt-0.5 text-xs text-gray-400">{formatCurrency(item.price)} / 件</p>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded border border-gray-200">
                    <button
                      className="w-7 py-0.5 text-center text-gray-500 transition hover:bg-gray-50"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      type="button"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      className="w-7 py-0.5 text-center text-gray-500 transition hover:bg-gray-50"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="text-xs text-gray-400 underline transition hover:text-red-500"
                    onClick={() => removeItem(item.id)}
                    type="button"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            className="mt-2 text-center text-sm text-gray-400 underline transition hover:text-red-500"
            onClick={clearCart}
            type="button"
          >
            清空购物车
          </button>
        </div>
      )}
    </Drawer>
  );
}
