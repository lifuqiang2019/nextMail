"use client";

import { Button, Card, Form, Input, Segmented, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";

type CustomerAuthCardProps = {
  successRedirect?: string;
  title?: string;
  description?: string;
};

export function CustomerAuthCard({
  successRedirect = "/",
  title,
  description,
}: CustomerAuthCardProps = {}) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  const submit = async (values: { name?: string; email: string; password: string }) => {
    setLoading(true);
    const url = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();
    if (!response.ok) {
      message.error(data.message || "操作失败");
      setLoading(false);
      return;
    }

    message.success(mode === "login" ? "登录成功，欢迎回来！" : "注册成功，欢迎加入！");
    router.push(successRedirect);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <p className="auth-header__kicker">ACCOUNT</p>
        <h1 className="auth-header__title">
          {title || `欢迎登录 ${process.env.NEXT_PUBLIC_STORE_NAME || "商城"}`}
        </h1>
        <p className="auth-header__desc">
          {description || "登录后可同步购物车、查看订单记录，并继续完成你的下单流程。"}
        </p>
      </header>

      <Card
        className="auth-card"
        styles={{ body: { padding: "26px 22px" } }}
      >
        <Segmented
          block
          className="auth-tabs"
          onChange={(value) => setMode(value as "login" | "register")}
          options={[
            { label: "账号登录", value: "login" },
            { label: "快速注册", value: "register" },
          ]}
          value={mode}
        />

        <Form layout="vertical" onFinish={submit} size="large">
          {mode === "register" && (
            <Form.Item
              label={<span className="auth-form-label">昵称</span>}
              name="name"
              rules={[{ required: true, message: "请输入昵称" }]}
            >
              <Input
                prefix={<User size={16} />}
                placeholder="给自己取个昵称吧"
                className="auth-form-input"
              />
            </Form.Item>
          )}
          <Form.Item
            label={<span className="auth-form-label">邮箱</span>}
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "邮箱格式不正确" },
            ]}
          >
            <Input
              prefix={<Mail size={16} />}
              placeholder="name@example.com"
              className="auth-form-input"
            />
          </Form.Item>
          <Form.Item
            label={<span className="auth-form-label">密码</span>}
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少 6 位" },
            ]}
          >
            <Input.Password
              prefix={<Lock size={16} />}
              placeholder="请输入密码"
              className="auth-form-input"
            />
          </Form.Item>
          <Button
            block
            className="auth-submit-btn"
            htmlType="submit"
            loading={loading}
            type="primary"
          >
            {mode === "login" ? "登 录" : "注册并登录"}
          </Button>
        </Form>

        <div className="auth-switch">
          <p>
            {mode === "login" ? "还没有账号？" : "已有账号？"}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              type="button"
            >
              {mode === "login" ? "立即注册" : "立即登录"}
            </button>
          </p>
        </div>
      </Card>

      <footer className="auth-footer">
        登录即表示同意我们的{" "}
        <span className="auth-footer__link">《用户协议》</span> 和{" "}
        <span className="auth-footer__link">《隐私政策》</span>
      </footer>
    </div>
  );
}
