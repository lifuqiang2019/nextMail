"use client";

import Link from "next/link";
import { Button, message } from "antd";
import { Copy, ExternalLink, MessageCircle, Phone, Mail } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import type { StoreSettings } from "@/types/store";

export function CheckoutShell({ settings }: { settings: StoreSettings }) {
  const { items, subtotal, updateQuantity, removeItem } = useCart();
  const [messageApi, contextHolder] = message.useMessage();
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(settings.orderLink).catch(() => {});
    setCopied(true);
    messageApi.success({ content: "订单链接已复制", duration: 1.5 });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
      {contextHolder}

      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/" className="hover:text-orange-500 transition">首页</Link>
          <span>/</span>
          <span className="text-gray-700">购物车</span>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="tm-card p-4">
            <h2 className="mb-4 border-b border-gray-100 pb-3 text-base font-bold text-gray-800">
              购物车商品（共 {items.reduce((s, i) => s + i.quantity, 0)} 件）
            </h2>
            {items.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-400">
                <span className="text-5xl">🛒</span>
                <p className="mt-4 font-medium">购物车是空的</p>
                <Link href="/" className="mt-3 tm-btn-primary px-6 py-2 text-sm inline-block">去逛逛</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div className="flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3" key={item.id}>
                    <div
                      className="h-20 w-20 shrink-0 rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : "linear-gradient(135deg, #f0f0f0, #e0e0e0)" }}
                    />
                    <div className="flex flex-1 flex-col justify-between overflow-hidden">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-400">¥{item.price} / 件</p>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded border border-gray-200 bg-white">
                          <button className="w-8 py-1 text-center text-gray-400 transition hover:bg-gray-50" onClick={() => updateQuantity(item.id, item.quantity - 1)} type="button">−</button>
                          <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <button className="w-8 py-1 text-center text-gray-400 transition hover:bg-gray-50" onClick={() => updateQuantity(item.id, item.quantity + 1)} type="button">+</button>
                        </div>
                        <span className="text-base font-bold text-red-500">¥{item.price * item.quantity}</span>
                      </div>
                    </div>
                    <button className="self-start text-xs text-gray-300 transition hover:text-red-400" onClick={() => removeItem(item.id)} type="button">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tm-card p-4">
            <h2 className="mb-4 border-b border-gray-100 pb-3 text-base font-bold text-gray-800">联系商家购买</h2>
            <p className="mb-4 text-sm leading-7 text-gray-600">{settings.purchaseGuide}</p>

            <div className="grid gap-3 sm:grid-cols-2">
              {settings.supportPhone && (
                <a className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm font-medium text-orange-600 transition hover:border-orange-400 hover:bg-orange-100" href={`tel:${settings.supportPhone}`}>
                  <Phone size={18} />
                  <span>{settings.supportPhone}</span>
                </a>
              )}
              {settings.supportEmail && (
                <a className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-medium text-blue-600 transition hover:border-blue-400 hover:bg-blue-100" href={`mailto:${settings.supportEmail}`}>
                  <Mail size={18} />
                  <span>{settings.supportEmail}</span>
                </a>
              )}
            </div>

            <div className="mt-4 rounded-lg border-2 border-dashed border-gray-200 p-4">
              <p className="mb-2 text-xs uppercase tracking-widest text-gray-400">统一订单链接（所有人可见）</p>
              <div className="flex items-center gap-3">
                <a className="flex-1 truncate text-sm font-medium text-sky-600 hover:underline" href={settings.orderLink} rel="noreferrer" target="_blank">
                  {settings.orderLink}
                </a>
                <button
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 transition hover:border-orange-300 hover:text-orange-500"
                  onClick={copyLink}
                  type="button"
                >
                  <Copy size={12} />
                  {copied ? "已复制" : "复制链接"}
                </button>
                <a
                  className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 transition hover:border-orange-300 hover:text-orange-500"
                  href={settings.orderLink}
                  rel="noreferrer"
                  target="_blank"
                >
                  <ExternalLink size={12} />
                  打开
                </a>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="tm-card p-4">
            <h2 className="mb-4 border-b border-gray-100 pb-3 text-base font-bold text-gray-800">订单摘要</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>商品总价</span>
                <span>¥{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>运费</span>
                <span className="text-orange-500">联系确认</span>
              </div>
              <div className="border-t border-gray-100 pt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">合计</span>
                  <span className="text-xl font-bold text-red-500">¥{subtotal}</span>
                </div>
              </div>
            </div>
            <Button
              block
              className="mt-4 !rounded-lg !bg-gradient-to-r !from-orange-500 !to-red-500 !border-none !py-5 !text-base !font-bold !text-white hover:!from-orange-600 hover:!to-red-600"
              disabled={items.length === 0}
              size="large"
              type="primary"
            >
              {items.length === 0 ? "购物车是空的" : "联系商家购买"}
            </Button>
          </div>

          <div className="tm-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <MessageCircle size={18} style={{ color: "#ff5000" }} />
              <h3 className="font-bold text-gray-800">购买说明</h3>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <p>1. 提交订单后，截图当前页面</p>
              <p>2. 通过上方的联系方式发送给商家</p>
              <p>3. 商家确认后即可安排发货</p>
              <p>4. 订单链接所有人可见，方便核对</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
