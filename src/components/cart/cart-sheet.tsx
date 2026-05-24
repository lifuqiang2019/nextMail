"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";

export function CartSheet() {
  const {
    clearCart,
    closeCart,
    isOpen,
    items,
    removeItem,
    subtotal,
    updateQuantity,
  } = useCart();

  return (
    <>
      {isOpen ? (
        <button
          aria-label="关闭购物车遮罩"
          className="fixed inset-0 z-40 bg-slate-950/45"
          onClick={closeCart}
          type="button"
        />
      ) : null}
      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <p className="text-sm text-slate-500">购物车</p>
            <h2 className="text-lg font-semibold text-slate-900">已选商品</h2>
          </div>
          <button
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            onClick={closeCart}
            type="button"
          >
            关闭
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
              购物车还是空的，去首页挑几件商品吧。
            </div>
          ) : (
            items.map((item) => (
              <div
                className="rounded-3xl border border-slate-200 p-4 shadow-sm"
                key={item.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-slate-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatCurrency(item.price)} / 件
                    </p>
                  </div>
                  <button
                    className="text-sm text-rose-500 transition hover:text-rose-600"
                    onClick={() => removeItem(item.id)}
                    type="button"
                  >
                    删除
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-full border border-slate-200">
                    <button
                      className="px-3 py-1 text-slate-600"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      type="button"
                    >
                      -
                    </button>
                    <span className="min-w-10 text-center text-sm font-medium text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      className="px-3 py-1 text-slate-600 disabled:cursor-not-allowed disabled:text-slate-300"
                      disabled={item.quantity >= item.inventory}
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-slate-400">库存 {item.inventory} 件</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>小计</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              className="flex-1 rounded-full border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
              onClick={clearCart}
              type="button"
            >
              清空
            </button>
            <Link
              className="flex-1 rounded-full bg-slate-950 px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-800"
              href="/cart"
              onClick={closeCart}
            >
              去结算页
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
