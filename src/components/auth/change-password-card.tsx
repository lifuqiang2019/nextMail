"use client";

import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import { notifyAuthChanged } from "@/components/providers/auth-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { formatDate, formatCurrency } from "@/lib/format";
import type { CustomerProfile, Order } from "@/types/store";

function getOrderStatusLabel(status: string, t: (key: string) => string) {
  switch (status.toUpperCase()) {
    case "PENDING":
      return t("status.pending");
    case "PAID":
      return t("status.paid");
    case "SHIPPED":
      return t("status.shipped");
    case "COMPLETED":
      return t("status.completed");
    case "CANCELLED":
      return t("status.cancelled");
    default:
      return status;
  }
}

export function ChangePasswordCard({ user, orders }: { user: CustomerProfile; orders: Order[] }) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const recentOrders = orders.slice(0, 3);
  const pendingCount = orders.filter((order) => ["PENDING", "PAID"].includes(order.status.toUpperCase())).length;
  const shippedCount = orders.filter((order) => order.status.toUpperCase() === "SHIPPED").length;
  const completedCount = orders.filter((order) => order.status.toUpperCase() === "COMPLETED").length;

  const submit = async (values: { currentPassword: string; newPassword: string }) => {
    setLoading(true);
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      message.error(data.message || t("account.changePasswordFailed"));
      setLoading(false);
      return;
    }
    message.success(t("account.changePasswordSuccess"));
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      notifyAuthChanged();
      router.push("/");
      router.refresh();
    } catch {
      message.error(t("account.logoutFailed"));
    }
  };

  return (
    <div className="account-page">
      <header className="account-header">
        <h1 className="account-header__title">{t("account.title")}</h1>
        <p className="account-header__desc">{t("account.desc")}</p>
      </header>

      <div className="account-grid">
        <aside className="account-sidebar">
          <div className="profile-card">
            <div className="profile-card__user">
              <div className="profile-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="profile-info__name">{user.name}</p>
                <p className="profile-info__email">{user.email}</p>
              </div>
            </div>

            <div className="profile-stats">
              <div>
                <div className="profile-stat__value">{pendingCount}</div>
                <div className="profile-stat__label">{t("account.pending")}</div>
              </div>
              <div>
                <div className="profile-stat__value">{shippedCount}</div>
                <div className="profile-stat__label">{t("account.shipped")}</div>
              </div>
              <div>
                <div className="profile-stat__value">{completedCount}</div>
                <div className="profile-stat__label">{t("account.completed")}</div>
              </div>
            </div>
          </div>

          <nav className="menu-list">
            <Link href="/orders" className="menu-item">
              <div className="menu-item__left">
                <span className="menu-item__icon menu-item__icon--order">
                  📦
                </span>
                <span className="menu-item__text">{t("account.myOrders")}</span>
              </div>
              <span className="menu-item__arrow">›</span>
            </Link>

            <button
              className="menu-item w-full text-left"
              onClick={() => document.getElementById("password-section")?.scrollIntoView({ behavior: "smooth" })}
              type="button"
            >
              <div className="menu-item__left">
                <span className="menu-item__icon menu-item__icon--password">
                  🔐
                </span>
                <span className="menu-item__text">{t("account.changePassword")}</span>
              </div>
              <span className="menu-item__arrow">›</span>
            </button>

            <button className="menu-item w-full text-left" onClick={handleLogout} type="button">
              <div className="menu-item__left">
                <span className="menu-item__icon menu-item__icon--logout">
                  🚪
                </span>
                <span className="menu-item__text">{t("common.logout")}</span>
              </div>
              <span className="menu-item__arrow">›</span>
            </button>
          </nav>
        </aside>

        <main>
          <section className="orders-section">
            <header className="orders-section__header">
              <h2 className="orders-section__title">{t("account.recentOrders")}</h2>
              <Link href="/orders" className="orders-section__link">
                {t("account.viewAll")}
              </Link>
            </header>

            {recentOrders.length === 0 ? (
              <div className="orders-empty">
                <p className="orders-empty__title">{t("account.noOrders")}</p>
                <p className="orders-empty__desc">{t("account.noOrdersDesc")}</p>
                <Link href="/" className="orders-action">
                  {t("account.goShopping")}
                </Link>
              </div>
            ) : (
              <div className="account-orders-preview">
                {recentOrders.map((order) => (
                  <article className="account-orders-preview__item" key={order.id}>
                    <div className="account-orders-preview__top">
                      <div className="min-w-0">
                        <p className="account-orders-preview__id">{order.id}</p>
                        <p className="account-orders-preview__time">{formatDate(order.createdAt, locale)}</p>
                      </div>
                      <span className="tm-tag">{getOrderStatusLabel(order.status, t)}</span>
                    </div>

                    <div className="account-orders-preview__items">
                      {order.items.slice(0, 2).map((item) => (
                        <div className="orders-line" key={item.id}>
                          <div className="orders-line__info">
                            <p className="orders-line__name">{item.productName}</p>
                            <p className="orders-line__meta">
                              {t("account.unitPriceQuantity", {
                                price: formatCurrency(item.productPrice, locale),
                                quantity: item.quantity,
                              })}
                            </p>
                          </div>
                          <p className="orders-line__total">{formatCurrency(item.lineTotal, locale)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="account-orders-preview__footer">
                      <p className="account-orders-preview__amount">
                        {formatCurrency(order.totalAmount, locale)}
                      </p>
                      <Link href="/orders" className="orders-section__link">
                        {t("account.viewDetails")}
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section id="password-section" className="password-form">
            <h2 className="password-form__title">{t("account.passwordSectionTitle")}</h2>

            <Form layout="vertical" onFinish={submit} size="large">
              <Form.Item
                label={<span className="auth-form-label">{t("account.currentPassword")}</span>}
                name="currentPassword"
                rules={[{ required: true, message: t("account.currentPasswordRequired") }]}
              >
                <Input.Password
                  placeholder={t("account.currentPasswordPlaceholder")}
                  className="checkout-input"
                />
              </Form.Item>

              <Form.Item
                label={<span className="auth-form-label">{t("account.newPasswordLabel")}</span>}
                name="newPassword"
                rules={[
                  { required: true, message: t("account.newPasswordRequired") },
                  { min: 6, message: t("auth.passwordMin") },
                ]}
              >
                <Input.Password
                  placeholder={t("account.newPasswordPlaceholder")}
                  className="checkout-input"
                />
              </Form.Item>

              <Button
                className="auth-submit-btn"
                htmlType="submit"
                loading={loading}
                type="primary"
              >
                {t("account.saveNewPassword")}
              </Button>
            </Form>
          </section>
        </main>
      </div>
    </div>
  );
}
