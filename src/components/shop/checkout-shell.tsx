"use client";

import Link from "next/link";
import { Button, message } from "antd";
import { ExternalLink, Mail, MapPinned, MessageCircle, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useCart } from "@/components/cart/cart-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { formatCurrency } from "@/lib/format";
import type { CheckoutFormData, StoreSettings } from "@/types/store";

type CheckoutShellProps = {
  settings: StoreSettings;
  databaseConfigured: boolean;
};

type CheckoutFormState = Partial<CheckoutFormData> & {
  note: string;
};

const EMPTY_FORM: CheckoutFormState = {
  receiverPhone: "",
  receiverAddress: "",
  note: "",
};

export function CheckoutShell({ settings, databaseConfigured }: CheckoutShellProps) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [messageApi, contextHolder] = message.useMessage();
  const [formData, setFormData] = useState<CheckoutFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmitOrder = useMemo(() => {
    return databaseConfigured && Boolean(user) && items.length > 0 && !isLoading && !isSubmitting;
  }, [databaseConfigured, isLoading, isSubmitting, items.length, user]);

  const updateField = (field: keyof CheckoutFormState, value: string) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submitOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!databaseConfigured) {
      messageApi.error("当前未配置数据库，暂时无法提交订单。");
      return;
    }

    if (isLoading) {
      messageApi.info("正在确认登录状态，请稍后再试。");
      return;
    }

    if (!user) {
      messageApi.error("请先登录后再下单。");
      router.push("/auth");
      return;
    }

    if (items.length === 0) {
      messageApi.warning("购物车为空，先去挑选商品吧。");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiverName: formData.receiverName ?? user.name,
          receiverPhone: formData.receiverPhone,
          receiverEmail: formData.receiverEmail ?? user.email,
          receiverAddress: formData.receiverAddress,
          note: formData.note.trim() || undefined,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json()) as { message?: string; orderId?: string };

      if (!response.ok) {
        throw new Error(data.message || "下单失败，请稍后重试。");
      }

      clearCart();
      messageApi.success({ content: "下单成功，正在跳转订单页。", duration: 1.5 });
      router.push("/orders");
      router.refresh();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : "下单失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
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
                      <p className="text-xs text-gray-400">{formatCurrency(item.price)} / 件</p>
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex items-center gap-2 rounded border border-gray-200 bg-white">
                          <button className="w-8 py-1 text-center text-gray-400 transition hover:bg-gray-50" onClick={() => updateQuantity(item.id, item.quantity - 1)} type="button">−</button>
                          <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <button className="w-8 py-1 text-center text-gray-400 transition hover:bg-gray-50" onClick={() => updateQuantity(item.id, item.quantity + 1)} type="button">+</button>
                        </div>
                        <span className="text-base font-bold text-red-500">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                    <button className="self-start text-xs text-gray-300 transition hover:text-red-400" onClick={() => removeItem(item.id)} type="button">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tm-card p-4">
            <div className="mb-4 border-b border-gray-100 pb-3">
              <h2 className="text-base font-bold text-gray-800">填写收货信息</h2>
              <p className="mt-2 text-sm leading-7 text-gray-500">
                下单后会自动生成订单记录，你可以在订单页查看自己的订单。
              </p>
            </div>

            {!databaseConfigured ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-700">
                当前还没有配置 `DATABASE_URL`，现在只能浏览商品和购物车，暂时无法真正提交订单。
              </div>
            ) : isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                正在确认登录状态...
              </div>
            ) : !user ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <p className="text-sm leading-7 text-slate-600">提交订单前需要先登录账号，登录后会自动带出你的联系邮箱。</p>
                <div className="mt-3">
                  <Link
                    className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    href="/auth"
                  >
                    去登录
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                当前已登录：{user.email}
              </div>
            )}

            <form className="mt-4 space-y-4" onSubmit={submitOrder}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-gray-700">收货人</span>
                  <input
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
                    disabled={!databaseConfigured || isSubmitting}
                    onChange={(event) => updateField("receiverName", event.target.value)}
                    placeholder="请输入收货人姓名"
                    required
                    value={formData.receiverName ?? user?.name ?? ""}
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-medium text-gray-700">联系电话</span>
                  <input
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
                    disabled={!databaseConfigured || isSubmitting}
                    onChange={(event) => updateField("receiverPhone", event.target.value)}
                    placeholder="请输入手机号或联系电话"
                    required
                    value={formData.receiverPhone}
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-700">联系邮箱</span>
                <input
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
                  disabled={!databaseConfigured || isSubmitting}
                  onChange={(event) => updateField("receiverEmail", event.target.value)}
                  placeholder="请输入联系邮箱"
                  required
                  type="email"
                    value={formData.receiverEmail ?? user?.email ?? ""}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-700">收货地址</span>
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
                  disabled={!databaseConfigured || isSubmitting}
                  onChange={(event) => updateField("receiverAddress", event.target.value)}
                  placeholder="请输入详细收货地址"
                  required
                  value={formData.receiverAddress}
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-gray-700">订单备注</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-orange-400"
                  disabled={!databaseConfigured || isSubmitting}
                  maxLength={200}
                  onChange={(event) => updateField("note", event.target.value)}
                  placeholder="如有配送时间、颜色尺码补充说明，可写在这里"
                  value={formData.note}
                />
              </label>

              <Button
                block
                className="!rounded-lg !border-none !bg-gradient-to-r !from-orange-500 !to-red-500 !py-5 !text-base !font-bold !text-white hover:!from-orange-600 hover:!to-red-600"
                disabled={!canSubmitOrder}
                htmlType="submit"
                loading={isSubmitting}
                size="large"
                type="primary"
              >
                {!databaseConfigured
                  ? "当前不可下单"
                  : isLoading
                    ? "确认登录状态中..."
                    : !user
                      ? "请先登录后下单"
                      : items.length === 0
                        ? "购物车是空的"
                        : "提交订单"}
              </Button>
            </form>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="tm-card p-4">
            <h2 className="mb-4 border-b border-gray-100 pb-3 text-base font-bold text-gray-800">订单摘要</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>商品总价</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>运费</span>
                <span className="text-orange-500">下单后确认</span>
              </div>
              <div className="border-t border-gray-100 pt-2">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">合计</span>
                  <span className="text-xl font-bold text-red-500">{formatCurrency(subtotal)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="tm-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <MessageCircle size={18} style={{ color: "#ff5000" }} />
              <h3 className="font-bold text-gray-800">购买说明</h3>
            </div>
            <div className="space-y-2 text-xs text-gray-500">
              <p>1. 请先确认购物车商品和数量无误</p>
              <p>2. 填写完整的收货信息后提交订单</p>
              <p>3. 提交成功后可在“我的订单”查看记录</p>
              <p>4. 如库存不足，系统会明确提示失败原因</p>
            </div>
          </div>

          <div className="tm-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <MapPinned size={18} style={{ color: "#ff5000" }} />
              <h3 className="font-bold text-gray-800">商家联系信息</h3>
            </div>
            <p className="text-sm leading-7 text-gray-600">{settings.purchaseGuide}</p>

            <div className="mt-4 space-y-3">
              {settings.supportPhone ? (
                <a
                  className="flex items-center gap-3 rounded-lg border border-orange-200 bg-orange-50 p-3 text-sm font-medium text-orange-600 transition hover:border-orange-400 hover:bg-orange-100"
                  href={`tel:${settings.supportPhone}`}
                >
                  <Phone size={18} />
                  <span>{settings.supportPhone}</span>
                </a>
              ) : null}
              {settings.supportEmail ? (
                <a
                  className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm font-medium text-blue-600 transition hover:border-blue-400 hover:bg-blue-100"
                  href={`mailto:${settings.supportEmail}`}
                >
                  <Mail size={18} />
                  <span>{settings.supportEmail}</span>
                </a>
              ) : null}
              {settings.orderLink ? (
                <a
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-medium text-slate-600 transition hover:border-orange-300 hover:text-orange-500"
                  href={settings.orderLink}
                  rel="noreferrer"
                  target="_blank"
                >
                  <span className="truncate pr-4">{settings.orderLink}</span>
                  <ExternalLink className="shrink-0" size={14} />
                </a>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
