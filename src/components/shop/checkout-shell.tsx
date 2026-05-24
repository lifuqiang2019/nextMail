"use client";

import Link from "next/link";

import { useCart } from "@/components/cart/cart-provider";
import type { StoreSettings } from "@/types/store";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function CheckoutShell({ settings }: { settings: StoreSettings }) {
  const { clearCart, items, subtotal, updateQuantity } = useCart();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10">
      <section className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6">
        <p className="text-sm text-slate-500">Checkout</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">下单联系页</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">下单后不走在线支付，你可以直接用订单截图或统一订单链接联系商家完成购买。</p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">购物清单</p>
              <h2 className="text-xl font-semibold text-slate-950">商品明细</h2>
            </div>
            <button className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700" onClick={clearCart} type="button">
              清空购物车
            </button>
          </div>

          <div className="mt-5 space-y-4">
            {items.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-base font-medium text-slate-900">购物车还是空的</p>
                <p className="mt-2 text-sm text-slate-500">返回首页筛选商品后，这里会展示待购买清单。</p>
                <Link className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white" href="/">
                  去逛商城
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div className="flex gap-4 rounded-3xl border border-slate-200 p-4" key={item.id}>
                  <div className="h-20 w-20 shrink-0 rounded-2xl bg-cover bg-center" style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined }} />
                  <div className="flex flex-1 flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{item.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">单价 {formatCurrency(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="inline-flex items-center rounded-full border border-slate-200">
                        <button className="px-3 py-1 text-slate-600" onClick={() => updateQuantity(item.id, item.quantity - 1)} type="button">-</button>
                        <span className="min-w-10 text-center text-sm font-medium text-slate-900">{item.quantity}</span>
                        <button className="px-3 py-1 text-slate-600" onClick={() => updateQuantity(item.id, item.quantity + 1)} type="button">+</button>
                      </div>
                      <span className="text-right text-lg font-semibold text-slate-950">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm text-slate-500">订单摘要</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">待确认金额</h2>
            <div className="mt-6 space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between"><span>商品总额</span><span>{formatCurrency(subtotal)}</span></div>
              <div className="flex items-center justify-between"><span>运费</span><span>{subtotal > 0 ? "联系商家确认" : formatCurrency(0)}</span></div>
            </div>
            <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-sm text-slate-300">合计</p>
              <p className="mt-2 text-3xl font-semibold">{formatCurrency(subtotal)}</p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-sm text-slate-500">联系商家购买</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">后台自定义联系信息</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{settings.purchaseGuide}</p>
            <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
              <p>联系电话：{settings.supportPhone}</p>
              <p>联系邮箱：{settings.supportEmail}</p>
            </div>
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">订单链接</p>
              <a className="mt-2 block break-all text-sm font-medium text-sky-600" href={settings.orderLink} rel="noreferrer" target="_blank">
                {settings.orderLink}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
