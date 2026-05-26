"use client";

import { Button, Card, Form, Input, Segmented, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
      message.error(data.message || t("auth.actionFailed"));
      setLoading(false);
      return;
    }

    message.success(mode === "login" ? t("auth.loginSuccess") : t("auth.registerSuccess"));
    router.push(successRedirect);
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <header className="auth-header">
        <p className="auth-header__kicker">{t("auth.kicker")}</p>
        <h1 className="auth-header__title">
          {title || t("auth.welcome", { storeName: process.env.NEXT_PUBLIC_STORE_NAME || "商城" })}
        </h1>
        <p className="auth-header__desc">
          {description || t("auth.desc")}
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
            { label: t("auth.loginTab"), value: "login" },
            { label: t("auth.registerTab"), value: "register" },
          ]}
          value={mode}
        />

        <Form layout="vertical" onFinish={submit} size="large">
          {mode === "register" && (
            <Form.Item
              label={<span className="auth-form-label">{t("auth.nickname")}</span>}
              name="name"
              rules={[{ required: true, message: t("auth.nicknameRequired") }]}
            >
              <Input
                prefix={<User size={16} />}
                placeholder={t("auth.nicknamePlaceholder")}
                className="auth-form-input"
              />
            </Form.Item>
          )}
          <Form.Item
            label={<span className="auth-form-label">{t("auth.email")}</span>}
            name="email"
            rules={[
              { required: true, message: t("auth.emailRequired") },
              { type: "email", message: t("auth.emailInvalid") },
            ]}
          >
            <Input
              prefix={<Mail size={16} />}
              placeholder="name@example.com"
              className="auth-form-input"
            />
          </Form.Item>
          <Form.Item
            label={<span className="auth-form-label">{t("auth.password")}</span>}
            name="password"
            rules={[
              { required: true, message: t("auth.passwordRequired") },
              { min: 6, message: t("auth.passwordMin") },
            ]}
          >
            <Input.Password
              prefix={<Lock size={16} />}
              placeholder={t("auth.passwordPlaceholder")}
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
            {mode === "login" ? t("auth.loginSubmit") : t("auth.registerSubmit")}
          </Button>
        </Form>

        <div className="auth-switch">
          <p>
            {mode === "login" ? t("auth.noAccount") : t("auth.hasAccount")}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              type="button"
            >
              {mode === "login" ? t("auth.registerNow") : t("auth.loginNow")}
            </button>
          </p>
        </div>
      </Card>

      <footer className="auth-footer">
        {t("auth.agreementPrefix")} <span className="auth-footer__link">{t("auth.terms")}</span> {t("auth.and")}{" "}
        <span className="auth-footer__link">{t("auth.privacy")}</span>
      </footer>
    </div>
  );
}
