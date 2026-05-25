"use client";

import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import type { CustomerProfile, Order } from "@/types/store";

function getOrderStatusLabel(status: string) {
  switch (status.toUpperCase()) {
    case "PENDING":
      return "待处理";
    case "PAID":
      return "已支付";
    case "SHIPPED":
      return "已发货";
    case "COMPLETED":
      return "已完成";
    case "CANCELLED":
      return "已取消";
    default:
      return status;
  }
}

function formatOrderTime(value: string) {
  return new Date(value).toLocaleDateString("zh-CN");
}

export function ChangePasswordCard({ user, orders }: { user: CustomerProfile; orders: Order[] }) {
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
      message.error(data.message || "修改失败");
      setLoading(false);
      return;
    }
    message.success("密码修改成功！");
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch {
      message.error("退出失败");
    }
  };

  return (
    <div className="account-page">
      <header className="account-header">
        <h1 className="account-header__title">账号中心</h1>
        <p className="account-header__desc">管理个人信息与安全设置</p>
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
                <div className="profile-stat__label">待处理</div>
              </div>
              <div>
                <div className="profile-stat__value">{shippedCount}</div>
                <div className="profile-stat__label">待发货</div>
              </div>
              <div>
                <div className="profile-stat__value">{completedCount}</div>
                <div className="profile-stat__label">已完成</div>
              </div>
            </div>
          </div>

          <nav className="menu-list">
            <Link href="/orders" className="menu-item">
              <div className="menu-item__left">
                <span className="menu-item__icon menu-item__icon--order">
                  📦
                </span>
                <span className="menu-item__text">我的订单</span>
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
                <span className="menu-item__text">修改密码</span>
              </div>
              <span className="menu-item__arrow">›</span>
            </button>

            <button className="menu-item w-full text-left" onClick={handleLogout} type="button">
              <div className="menu-item__left">
                <span className="menu-item__icon menu-item__icon--logout">
                  🚪
                </span>
                <span className="menu-item__text">退出登录</span>
              </div>
              <span className="menu-item__arrow">›</span>
            </button>
          </nav>
        </aside>

        <main>
          <section className="orders-section">
            <header className="orders-section__header">
              <h2 className="orders-section__title">最近订单</h2>
              <Link href="/orders" className="orders-section__link">
                查看全部 ›
              </Link>
            </header>

            {recentOrders.length === 0 ? (
              <div className="orders-empty">
                <p className="orders-empty__title">暂无订单记录</p>
                <p className="orders-empty__desc">去首页挑选商品后，就可以在这里快速查看最近订单。</p>
                <Link href="/" className="orders-action">
                  去购物
                </Link>
              </div>
            ) : (
              <div className="account-orders-preview">
                {recentOrders.map((order) => (
                  <article className="account-orders-preview__item" key={order.id}>
                    <div className="account-orders-preview__top">
                      <div className="min-w-0">
                        <p className="account-orders-preview__id">{order.id}</p>
                        <p className="account-orders-preview__time">{formatOrderTime(order.createdAt)}</p>
                      </div>
                      <span className="tm-tag">{getOrderStatusLabel(order.status)}</span>
                    </div>

                    <div className="account-orders-preview__items">
                      {order.items.slice(0, 2).map((item) => (
                        <div className="orders-line" key={item.id}>
                          <div className="orders-line__info">
                            <p className="orders-line__name">{item.productName}</p>
                            <p className="orders-line__meta">
                              单价 {formatCurrency(item.productPrice)} · 数量 {item.quantity}
                            </p>
                          </div>
                          <p className="orders-line__total">{formatCurrency(item.lineTotal)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="account-orders-preview__footer">
                      <p className="account-orders-preview__amount">{formatCurrency(order.totalAmount)}</p>
                      <Link href="/orders" className="orders-section__link">
                        查看详情 ›
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section id="password-section" className="password-form">
            <h2 className="password-form__title">🔐 修改密码</h2>
            
            <Form layout="vertical" onFinish={submit} size="large">
              <Form.Item
                label={<span className="auth-form-label">当前密码</span>}
                name="currentPassword"
                rules={[{ required: true, message: "请输入当前密码" }]}
              >
                <Input.Password 
                  placeholder="请输入当前密码"
                  className="checkout-input"
                />
              </Form.Item>
              
              <Form.Item
                label={<span className="auth-form-label">新密码（至少 6 位）</span>}
                name="newPassword"
                rules={[
                  { required: true, message: "请输入新密码" }, 
                  { min: 6, message: "密码至少 6 位" }
                ]}
              >
                <Input.Password 
                  placeholder="请输入新密码"
                  className="checkout-input"
                />
              </Form.Item>
              
              <Button
                className="auth-submit-btn"
                htmlType="submit"
                loading={loading}
                type="primary"
              >
                保存新密码
              </Button>
            </Form>
          </section>
        </main>
      </div>
    </div>
  );
}
