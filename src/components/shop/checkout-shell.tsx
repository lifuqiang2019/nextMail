"use client";

import Link from "next/link";
import { Button, message } from "antd";
import { ExternalLink, Mail, MapPinned, MessageCircle, Phone } from "lucide-react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { useCart } from "@/components/cart/cart-provider";
import { useLocale } from "@/components/providers/locale-provider";
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
  const { t } = useTranslation();
  const { locale } = useLocale();
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
      messageApi.error(t("checkout.messageDbNotConfigured"));
      return;
    }

    if (isLoading) {
      messageApi.info(t("checkout.messageCheckingLogin"));
      return;
    }

    if (!user) {
      messageApi.error(t("checkout.messageLoginRequired"));
      router.push("/auth");
      return;
    }

    if (items.length === 0) {
      messageApi.warning(t("checkout.messageEmptyCart"));
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
        throw new Error(data.message || t("checkout.messageOrderFailed"));
      }

      clearCart();
      messageApi.success({ content: t("checkout.messageOrderSuccess"), duration: 1.5 });
      router.push("/orders");
      router.refresh();
    } catch (error) {
      messageApi.error(error instanceof Error ? error.message : t("checkout.messageOrderFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="tm-shell cart-page">
      {contextHolder}

      <div className="cart-breadcrumb">
        <Link href="/">{t("common.home")}</Link>
        <span className="separator">/</span>
        <span className="current">{t("checkout.breadcrumbCurrent")}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
        <div className="space-y-4">
          <section className="cart-section">
            <header className="cart-section__header">
              {t("checkout.cartItemsHeader", {
                count: items.reduce((s, i) => s + i.quantity, 0),
              })}
            </header>

            {items.length === 0 ? (
              <div className="empty-state">
                <span className="text-4xl mb-3">🛒</span>
                <p className="empty-state__title">{t("checkout.cartEmptyTitle")}</p>
                <Link href="/" className="btn-cart inline-block">
                  {t("checkout.browseNow")}
                </Link>
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
                      <p className="cart-item__price">
                        {formatCurrency(item.price, locale)} {t("checkout.perItem")}
                      </p>
                      <div className="cart-item__bottom">
                        <div className="qty-selector">
                          <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                          <span className="qty-selector__value">{item.quantity}</span>
                          <button
                            disabled={item.quantity >= item.inventory}
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <span className="cart-item__total">
                            {formatCurrency(item.price * item.quantity, locale)}
                          </span>
                          <p className="mt-1 text-xs text-slate-400">
                            {t("checkout.stockCount", { count: item.inventory })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <button
                      aria-label={t("checkout.receiverDeleteAria", { name: item.name })}
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
              <h2 className="checkout-form__title">{t("checkout.shippingTitle")}</h2>
              <p className="checkout-form__desc">
                {t("checkout.shippingDesc")}
              </p>
            </header>

            {!databaseConfigured ? (
              <div className="alert alert--warning">
                {t("checkout.dbNotConfigured")}
              </div>
            ) : isLoading ? (
              <div className="alert alert--info">
                {t("checkout.checkingLogin")}
              </div>
            ) : !user ? (
              <div className="alert alert--default">
                <p>{t("checkout.loginRequiredDesc")}</p>
                <Link href="/auth" className="btn-cart mt-3">
                  {t("checkout.goLogin")}
                </Link>
              </div>
            ) : (
              <div className="alert alert--success">
                {t("checkout.loggedInAs", { email: user.email })}
              </div>
            )}

            <form onSubmit={submitOrder}>
              <div className="grid gap-3.5 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="auth-form-label">{t("checkout.receiverName")}</span>
                  <input
                    className="checkout-input"
                    disabled={!databaseConfigured || isSubmitting}
                    onChange={(event) => updateField("receiverName", event.target.value)}
                    placeholder={t("checkout.receiverNamePlaceholder")}
                    required
                    value={formData.receiverName ?? user?.name ?? ""}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="auth-form-label">{t("checkout.receiverPhone")}</span>
                  <input
                    className="checkout-input"
                    disabled={!databaseConfigured || isSubmitting}
                    onChange={(event) => updateField("receiverPhone", event.target.value)}
                    placeholder={t("checkout.receiverPhonePlaceholder")}
                    required
                    value={formData.receiverPhone}
                  />
                </label>
              </div>

              <label className="block space-y-1.5">
                <span className="auth-form-label">{t("checkout.receiverEmail")}</span>
                <input
                  className="checkout-input"
                  disabled={!databaseConfigured || isSubmitting}
                  onChange={(event) => updateField("receiverEmail", event.target.value)}
                  placeholder={t("checkout.receiverEmailPlaceholder")}
                  required
                  type="email"
                  value={formData.receiverEmail ?? user?.email ?? ""}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="auth-form-label">{t("checkout.receiverAddress")}</span>
                <textarea
                  className="checkout-input min-h-24"
                  disabled={!databaseConfigured || isSubmitting}
                  onChange={(event) => updateField("receiverAddress", event.target.value)}
                  placeholder={t("checkout.receiverAddressPlaceholder")}
                  required
                  value={formData.receiverAddress}
                />
              </label>

              <label className="block space-y-1.5">
                <span className="auth-form-label">{t("checkout.note")}</span>
                <textarea
                  className="checkout-input min-h-22"
                  disabled={!databaseConfigured || isSubmitting}
                  maxLength={200}
                  onChange={(event) => updateField("note", event.target.value)}
                  placeholder={t("checkout.notePlaceholder")}
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
                  ? t("checkout.submitUnavailable")
                  : isLoading
                    ? t("checkout.submitChecking")
                    : !user
                      ? t("checkout.submitLoginRequired")
                      : items.length === 0
                        ? t("checkout.submitEmptyCart")
                        : t("checkout.submitOrder")}
              </Button>
            </form>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="order-summary">
            <header className="order-summary__header">{t("checkout.orderSummary")}</header>
            <div className="order-summary__row">
              <span>{t("common.productSubtotal")}</span>
              <span>{formatCurrency(subtotal, locale)}</span>
            </div>
            <div className="order-summary__row">
              <span>{t("common.shippingFee")}</span>
              <span className="order-summary__shipping">{t("common.shippingPending")}</span>
            </div>
            <div className="order-summary__divider" />
            <div className="order-summary__row order-summary__row--total">
              <span className="order-summary__total-label">{t("common.total")}</span>
              <span className="order-summary__total-value">{formatCurrency(subtotal, locale)}</span>
            </div>
          </div>

          <div className="info-card info-card--guide">
            <header className="info-card__header">
              <MessageCircle size={17} />
              <h3>{t("checkout.purchaseGuide")}</h3>
            </header>
            <ul className="info-card__list">
              <li>{t("checkout.guide1")}</li>
              <li>{t("checkout.guide2")}</li>
              <li>{t("checkout.guide3")}</li>
              <li>{t("checkout.guide4")}</li>
            </ul>
          </div>

          <div className="info-card info-card--contact">
            <header className="info-card__header">
              <MapPinned size={17} />
              <h3>{t("checkout.merchantContact")}</h3>
            </header>
            <p className="info-card__desc">{settings.purchaseGuide}</p>

            <div className="info-card__links">
              {settings.supportPhone ? (
                <a href={`tel:${settings.supportPhone}`} className="info-link info-link--orange">
                  <Phone size={17} />
                  <span>{settings.supportPhone}</span>
                </a>
              ) : null}
              {settings.supportEmail ? (
                <a href={`mailto:${settings.supportEmail}`} className="info-link info-link--blue">
                  <Mail size={17} />
                  <span>{settings.supportEmail}</span>
                </a>
              ) : null}
              {settings.orderLink ? (
                <a href={settings.orderLink} rel="noreferrer" target="_blank" className="info-link info-link--gray">
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
