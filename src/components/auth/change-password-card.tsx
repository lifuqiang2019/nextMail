"use client";

import { Card, Form, Input, Button, message } from "antd";
import { useState } from "react";
import { Lock, ShoppingBag, Package, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { CustomerProfile } from "@/types/store";

export function ChangePasswordCard({ user }: { user: CustomerProfile }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

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
                <div className="profile-stat__value">0</div>
                <div className="profile-stat__label">待付款</div>
              </div>
              <div>
                <div className="profile-stat__value">0</div>
                <div className="profile-stat__label">待发货</div>
              </div>
              <div>
                <div className="profile-stat__value">0</div>
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

            <div className="menu-item" onClick={() => document.getElementById('password-section')?.scrollIntoView({ behavior: 'smooth' })}>
              <div className="menu-item__left">
                <span className="menu-item__icon menu-item__icon--password">
                  🔐
                </span>
                <span className="menu-item__text">修改密码</span>
              </div>
              <span className="menu-item__arrow">›</span>
            </div>

            <div className="menu-item" onClick={handleLogout}>
              <div className="menu-item__left">
                <span className="menu-item__icon menu-item__icon--logout">
                  🚪
                </span>
                <span className="menu-item__text">退出登录</span>
              </div>
              <span className="menu-item__arrow">›</span>
            </div>
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

            <div className="empty-orders">
              <div className="empty-orders__icon">📋</div>
              <p className="empty-orders__text">暂无订单记录</p>
              <Link href="/" className="btn-cart inline-block">去购物</Link>
            </div>
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
