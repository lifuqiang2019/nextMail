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
    <div className="tm-shell cart-page">
      {contextHolder}

      <div className="cart-breadcrumb">
        <Link href="/">首页</Link>
        <span>/</span>
        <span className="current">购物车</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <div className="space-y-4">
          <section className="cart-section">
            <header className="cart-section__header">
              购物车商品（共 {items.reduce((s, i) => s + i.quantity, 0)} 件）
            </header>
            
            {items.length === 0 ? (
              <div className="empty-state">
                <span className="text-4xl mb-3">🛒</span>
                <p className="empty-state__title">购物车是空的</p>
                <Link href="/" className="btn-cart inline-block">去逛逛</Link>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div
                      className="cart-item__image"
                      style={{ backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : "linear-gradient(135deg, #fafafa, #eaeaea)" }}
                    />
                    <div className="cart-item__info">
                      <h3 className="cart-item__name">{item.name}</h3>
                      <p className="cart-item__price">{formatCurrency(item.price)} / 件</p>
                      <div className="cart-item__bottom">
                        <div className="qty-selector">
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                          <span className="qty-selector__value">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                        <span className="cart-item__total">{formatCurrency(item.price * item.quantity)}</span>
                      </div>
                    </div>
                    <button
                      className="cart-item__delete"
                      type="button"
                      onClick={() => removeItem(item.id)}
                    >
                      ×
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="checkout-form">
            <header className="checkout-form__header">
              <p className="checkout-form__kicker">Checkout</p>
              <h2 className="checkout-form__title">填写收货信息</h2>
              <p className="checkout-form__desc">
                下单后会自动生成订单记录，你可以在订单页查看自己的订单。
              </p>
            </header>

            {!databaseConfigured ? (
              <div className="alert alert--warning">
                当前还没有配置 `DATABASE_URL`，现在只能浏览商品和购物车，暂时无法真正提交订单。
              </div>
            ) : isLoading ? (
              <div className="alert alert--info">
                正在确认登录状态...
              </div>
            ) : !user ? (
              <div className="alert alert--default">
                <p>提交订单前需要先登录账号，登录后会自动带出你的联系邮箱。</p>
                <Link href="/auth" className="btn-cart mt-3">去登录</Link>
              </div>
            ) : (
              <div className="alert alert--success">
                当前已登录：{user.email}
              </div>
            )}

            <form onSubmit={submitOrder}>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="auth-form-label">收货人</span>
                  <input
                    className="checkout-input"
                    disabled={!databaseConfigured || isSubmitting}
                    onChange={(event) => updateField("receiverName", event.target.value)}
                    placeholder="请输入收货人姓名"
                    required
                    value={formData.receiverName ?? user?.name ?? ""}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="auth-form-label">联系电话</span>
                  <input
                    className="checkout-input"
                    disabled={!databaseConfigured || isSubmitting}
                    onChange={(event) => updateField("receiverPhone", event.target.value)}
                    placeholder="请输入手机号或联系电话"
                    required
                    value={formData.receiverPhone}
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="auth-form-label">联系邮箱</span>
                <input
                  className="checkout-input"
                  disabled={!databaseConfigured || isSubmitting}
                  onChange={(event) => updateField("receiverEmail", event.target.value)}
                  placeholder="请输入联系邮箱"
                  required
                  type="email"
                  value={formData.receiverEmail ?? user?.email ?? ""}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="auth-form-label">收货地址</span>
                <textarea
                  className="checkout-input min-h-24"
                  disabled={!databaseConfigured || isSubmitting}
                  onChange={(event) => updateField("receiverAddress", event.target.value)}
                  placeholder="请输入详细收货地址"
                  required
                  value={formData.receiverAddress}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="auth-form-label">订单备注</span>
                <textarea
                  className="checkout-input min-h-22"
                  disabled={!databaseConfigured || isSubmitting}
                  maxLength={200}
                  onChange={(event) => updateField("note", event.target.value)}
                  placeholder="如有配送时间、颜色尺码补充说明，可写在这里"
                  value={formData.note}
                />
              </label>

              <Button
                block
                className="checkout-submit-btn"
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
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="order-summary">
            <header className="order-summary__header">订单摘要</header>
            <div className="order-summary__row">
              <span>商品总价</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="order-summary__row">
              <span>运费</span>
              <span className="order-summary__shipping">下单后确认</span>
            </div>
            <div className="order-summary__divider"></div>
            <div className="order-summary__total-row">
              <span className="order-summary__total-label">合计</span>
              <span className="order-summary__total-value">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          <div className="info-card info-card--guide">
            <header className="info-card__header">
              <MessageCircle size={17} />
              <h3>购买说明</h3>
            </header>
            <ul className="info-card__list">
              <li>1. 请先确认购物车商品和数量无误</li>
              <li>2. 填写完整的收货信息后提交订单</li>
              <li>3. 提交成功后可在"我的订单"查看记录</li>
              <li>4. 如库存不足，系统会明确提示失败原因</li>
            </ul>
          </div>

          <div className="info-card info-card--contact">
            <header className="info-card__header">
              <MapPinned size={17} />
              <h3>商家联系信息</h3>
            </header>
            <p className="info-card__desc">{settings.purchaseGuide}</p>

            <div className="info-card__links">
              {settings.supportPhone ? (
                <a href={`tel:${settings.supportPhone}`} className="info-link info-link--phone">
                  <Phone size={17} />
                  <span>{settings.supportPhone}</span>
                </a>
              ) : null}
              {settings.supportEmail ? (
                <a href={`mailto:${settings.supportEmail}`} className="info-link info-link--email">
                  <Mail size={17} />
                  <span>{settings.supportEmail}</span>
                </a>
              ) : null}
              {settings.orderLink ? (
                <a href={settings.orderLink} rel="noreferrer" target="_blank" className="info-link info-link--external">
                  <span>{settings.orderLink}</span>
                  <ExternalLink className="shrink-0" size={13} />
                </a>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
