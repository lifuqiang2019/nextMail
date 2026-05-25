"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";

export function CartSheet() {
  const {
    clearCart,
    closeCart,
    itemCount,
    isOpen,
    items,
    removeItem,
    subtotal,
    updateQuantity,
  } = useCart();
  const pathname = usePathname();
  const skuCount = items.length;

  useEffect(() => {
    if (pathname === "/cart" && isOpen) {
      closeCart();
    }
  }, [closeCart, isOpen, pathname]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeCart, isOpen]);

  if (pathname === "/cart" || !isOpen) {
    return null;
  }

  return (
    <>
      <div
        aria-hidden="true"
        className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[3px]"
        onClick={closeCart}
      />
      <aside
        aria-label="购物车抽屉"
        aria-modal="true"
        className="fixed top-0 right-0 z-50 flex h-full w-full max-w-[460px] flex-col overflow-hidden border-l border-slate-200/80 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] shadow-[0_26px_60px_rgba(15,23,42,0.28)]"
        role="dialog"
      >
        <div className="border-b border-slate-200/80 bg-[radial-gradient(circle_at_top_right,rgba(255,107,53,0.14),transparent_34%)] px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)]">
                <ShoppingBag size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Shopping Bag
                </p>
                <h2 className="mt-1 text-[22px] font-bold tracking-[-0.02em] text-slate-950">购物车</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {itemCount > 0
                    ? `已加入 ${skuCount} 款商品，可在这里直接修改数量、删除商品，再去结算。`
                    : "先挑几件喜欢的商品，加入购物车后会在这里统一确认。"}
                </p>
              </div>
            </div>
            <button
              aria-label="关闭购物车"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
              onClick={closeCart}
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">款数</p>
              <p className="mt-2 text-lg font-bold text-slate-950">{skuCount}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white px-3 py-3 shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">件数</p>
              <p className="mt-2 text-lg font-bold text-slate-950">{itemCount}</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-orange-200 bg-orange-50 px-3 py-3 shadow-sm sm:col-span-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-orange-500">小计</p>
              <p className="mt-2 text-sm font-bold text-orange-600">{formatCurrency(subtotal)}</p>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="mt-3 flex justify-end">
              <button
                className="inline-flex w-full items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:justify-start sm:py-1.5"
                disabled={items.length === 0}
                onClick={clearCart}
                type="button"
              >
                清空购物车
              </button>
            </div>
          ) : null}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-5 pb-6 sm:px-6 sm:py-6">
          {items.length === 0 ? (
            <div className="flex h-full min-h-[380px] flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <ShoppingBag size={28} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">购物车还是空的</h3>
              <p className="mt-2 max-w-[270px] text-sm leading-6 text-slate-600">
                去首页挑几件商品吧。加入购物车后，这里会帮你汇总商品、数量和总金额。
              </p>
              <div className="mt-6 flex w-full flex-col gap-3">
                <Link
                  className="inline-flex items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  href="/"
                  onClick={closeCart}
                >
                  去逛商城
                </Link>
                <button
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
                  onClick={closeCart}
                  type="button"
                >
                  先关闭抽屉
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="sticky top-0 z-10 rounded-[22px] border border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-950">已选商品</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">可以直接在这里增减数量或移除商品。</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-2 text-left sm:text-right">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">总件数</p>
                    <p className="mt-1 text-sm font-bold text-slate-950">{itemCount}</p>
                  </div>
                </div>
              </div>

              {items.map((item) => (
                <div
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                  key={item.id}
                >
                  <div className="flex flex-col gap-3.5 sm:flex-row">
                    <div
                      className="h-[88px] w-[88px] shrink-0 rounded-[22px] border border-slate-200 bg-cover bg-center bg-no-repeat shadow-inner"
                      style={{
                        backgroundImage: item.imageUrl
                          ? `url(${item.imageUrl})`
                          : "linear-gradient(135deg, #f8fafc, #e2e8f0)",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="line-clamp-2 text-[15px] font-semibold leading-6 text-slate-950">
                            {item.name}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                              单价 {formatCurrency(item.price)}
                            </span>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
                              数量 {item.quantity}
                            </span>
                            {item.badge ? (
                              <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-600">
                                {item.badge}
                              </span>
                            ) : null}
                            {item.inventory <= 3 ? (
                              <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                                库存紧张
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <button
                          className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-full border border-slate-200 px-3 text-xs font-medium text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-500 sm:w-auto"
                          onClick={() => removeItem(item.id)}
                          type="button"
                        >
                          <Trash2 size={14} />
                          删除
                        </button>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="min-w-0">
                          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 shadow-sm">
                            <button
                              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300"
                              disabled={item.quantity <= 1}
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              type="button"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="min-w-11 text-center text-sm font-bold text-slate-950">
                              {item.quantity}
                            </span>
                            <button
                              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:text-slate-300"
                              disabled={item.quantity >= item.inventory}
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              type="button"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <p className="mt-2 text-xs font-medium text-slate-600">
                            {item.inventory <= 3 ? `仅剩 ${item.inventory} 件，建议尽快结算` : `当前库存 ${item.inventory} 件`}
                          </p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 px-3 py-2 text-left sm:bg-transparent sm:px-0 sm:py-0 sm:text-right">
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            小计
                          </p>
                          <p className="mt-1 text-xl font-bold text-slate-950">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="shrink-0 border-t border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] px-4 pt-4 pb-6 shadow-[0_-10px_24px_rgba(15,23,42,0.06)] backdrop-blur sm:px-6 sm:pt-5 sm:pb-6"
          style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
        >
          <div className="rounded-[24px] border border-slate-800/20 bg-[linear-gradient(135deg,#0f172a_0%,#1e293b_100%)] p-4 text-white shadow-[0_18px_36px_rgba(15,23,42,0.22)]">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-100">
              <span>商品小计</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-200">应付预览</p>
                <p className="mt-1 text-2xl font-bold text-white">{formatCurrency(subtotal)}</p>
              </div>
              <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/15 px-3 py-1 text-xs font-medium text-white">
                {skuCount} 款 {itemCount} 件
              </span>
            </div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/12 px-3 py-2.5 text-xs leading-5 text-slate-100">
              说明：运费、优惠和最终应付金额会在结算页统一计算，这里先帮你确认商品金额。
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#22314a_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)] transition hover:bg-[linear-gradient(135deg,#1e293b_0%,#334155_100%)]"
              href="/cart"
              onClick={closeCart}
            >
              去结算页
              <ArrowRight size={16} />
            </Link>
            <button
              className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={items.length === 0}
              onClick={clearCart}
              type="button"
            >
              清空当前购物车
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
