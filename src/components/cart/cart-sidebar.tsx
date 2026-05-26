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
          <span className="text-base font-semibold">My Cart</span>
          {items.length > 0 && (
            <span className="ml-2 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
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
            <span className="text-gray-500">Subtotal (shipping excluded)</span>
            <span className="text-xl font-bold text-red-500">{formatCurrency(subtotal)}</span>
          </div>
          <button
            className="tm-btn-primary w-full py-3.5 text-base"
            disabled={items.length === 0}
            onClick={goCheckout}
            type="button"
          >
            Go to Checkout
          </button>
        </div>
      }
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <ShoppingCart size={56} strokeWidth={1} />
          <p className="mt-4 text-base">Your cart is empty</p>
          <button
            className="mt-4 rounded-full border border-orange-400 px-6 py-2 text-sm font-medium text-orange-500 transition hover:border-orange-500 hover:bg-orange-50"
            onClick={closeCart}
            type="button"
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {items.map((item) => (
            <div className="tm-muted-panel flex gap-3 rounded-[22px] p-3.5 shadow-none" key={item.id}>
              <div
                className="h-16 w-16 shrink-0 rounded-[16px] bg-cover bg-center"
                style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : "linear-gradient(135deg, #f0f0f0, #e0e0e0)" }}
              />
              <div className="flex flex-1 flex-col justify-between overflow-hidden">
                <p className="tm-pretty line-clamp-2 text-sm font-medium leading-6 text-slate-900">{item.name}</p>
                <p className="mt-0.5 text-xs text-gray-400">{formatCurrency(item.price)} / item</p>
                <div className="mt-1 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-1 py-1">
                    <button
                      className="w-7 rounded-full py-0.5 text-center text-gray-500 transition hover:bg-gray-50"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      type="button"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      className="w-7 rounded-full py-0.5 text-center text-gray-500 transition hover:bg-gray-50"
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
                    Remove
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
            Clear Cart
          </button>
        </div>
      )}
    </Drawer>
  );
}
