"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { formatCurrency } from "@/lib/format";
import type { CheckoutFormData } from "@/types/store";

export default function CartPage() {
  const router = useRouter();
  const { clearCart, items, subtotal, updateQuantity } = useCart();
  const { isLoading, user } = useAuth();
  const [checkoutForm, setCheckoutForm] = useState<CheckoutFormData>({
    receiverName: "",
    receiverPhone: "",
    receiverEmail: "",
    receiverAddress: "",
    note: "",
  });
  const [checkoutMessage, setCheckoutMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmitOrder = useMemo(() => {
    return Boolean(
      user &&
        items.length > 0 &&
        checkoutForm.receiverName.trim() &&
        checkoutForm.receiverPhone.trim() &&
        checkoutForm.receiverEmail.trim() &&
        checkoutForm.receiverAddress.trim(),
    );
  }, [checkoutForm, items.length, user]);

  function updateCheckoutField(
    field: keyof CheckoutFormData,
    value: string,
  ) {
    setCheckoutForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmitOrder() {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);
    setCheckoutMessage("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...checkoutForm,
          receiverEmail: checkoutForm.receiverEmail || user.email,
          items: items.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        }),
      });

      const data = (await response.json()) as { message?: string; orderId?: string };

      if (!response.ok) {
        throw new Error(data.message || "下单失败");
      }

      clearCart();
      router.push("/orders");
      router.refresh();
    } catch (error) {
      setCheckoutMessage(error instanceof Error ? error.message : "下单失败，请稍后重试。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm text-slate-500">Checkout</p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">购物车结算页</h1>
        <p className="mt-3 text-sm leading-7 text-slate-500 sm:text-base">
          这里已经接入邮箱登录、收货信息填写和订单创建流程，后续可以继续扩展支付、优惠券和订单状态流转。
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
                        className="px-3 py-1 text-slate-600 disabled:cursor-not-allowed disabled:text-slate-300"
                        disabled={item.quantity >= item.inventory}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        type="button"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-slate-400">
                      库存 {item.inventory} 件
                    </span>
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

          <div className="mt-6 rounded-3xl border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-500">账号状态</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {isLoading
                    ? "正在检查登录状态..."
                    : user
                      ? `已登录: ${user.email}`
                      : "未登录"}
                </p>
              </div>
              {!user && !isLoading ? (
                <Link
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                  href="/login"
                >
                  去登录
                </Link>
              ) : null}
            </div>

            <div className="mt-5 space-y-3">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">收货人</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  onChange={(event) => updateCheckoutField("receiverName", event.target.value)}
                  placeholder="请输入收货人姓名"
                  value={checkoutForm.receiverName}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">联系电话</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  onChange={(event) => updateCheckoutField("receiverPhone", event.target.value)}
                  placeholder="请输入联系电话"
                  value={checkoutForm.receiverPhone}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">联系邮箱</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  onChange={(event) => updateCheckoutField("receiverEmail", event.target.value)}
                  placeholder={user?.email || "请输入联系邮箱"}
                  value={checkoutForm.receiverEmail}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">收货地址</span>
                <textarea
                  className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  onChange={(event) => updateCheckoutField("receiverAddress", event.target.value)}
                  placeholder="请输入详细收货地址"
                  value={checkoutForm.receiverAddress}
                />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">订单备注</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  onChange={(event) => updateCheckoutField("note", event.target.value)}
                  placeholder="可选填写送货备注"
                  value={checkoutForm.note || ""}
                />
              </label>
            </div>
          </div>

          <button
            className="mt-6 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={!canSubmitOrder || isSubmitting}
            onClick={handleSubmitOrder}
            type="button"
          >
            {isSubmitting ? "提交中..." : "提交订单"}
          </button>

          <div
            className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
              checkoutMessage ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
            }`}
          >
            {checkoutMessage ||
              (user
                ? "填写收货信息后即可提交订单。"
                : "请先登录，再填写收货信息并下单。")}
          </div>
        </aside>
      </div>
    </div>
  );
}
