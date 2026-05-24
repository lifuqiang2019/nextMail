"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function CartPage() {
  const { clearCart, items, subtotal, updateQuantity } = useCart();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm text-slate-500">Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">购物车结算页</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
          当前为前台购物车示例，后续可以继续扩展登录、收货地址、订单、支付和优惠券能力。
        </p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[1.7fr_0.9fr]">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">已选商品</p>
              <h2 className="text-2xl font-semibold text-slate-950">商品明细</h2>
            </div>
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
              onClick={clearCart}
              type="button"
            >
              清空购物车
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-base font-medium text-slate-900">购物车还是空的</p>
                <p className="mt-2 text-sm text-slate-500">
                  返回首页添加商品后，这里会展示结算信息。
                </p>
                <Link
                  className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                  href="/"
                >
                  去逛商城
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  className="flex flex-col gap-4 rounded-3xl border border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between"
                  key={item.id}
                >
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{item.name}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      单价 {formatCurrency(item.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
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
                        className="px-3 py-1 text-slate-600"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <span className="min-w-28 text-right text-lg font-semibold text-slate-950">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="h-fit rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">订单摘要</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">待支付金额</h2>

          <div className="mt-6 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>商品总额</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>运费</span>
              <span>{subtotal > 0 ? "包邮" : formatCurrency(0)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-sm text-slate-300">合计</p>
            <p className="mt-2 text-3xl font-semibold">{formatCurrency(subtotal)}</p>
          </div>

          <button
            className="mt-6 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={items.length === 0}
            type="button"
          >
            提交订单
          </button>
        </aside>
      </div>
    </div>
  );
}
