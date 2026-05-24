"use client";

import { Button, Card, Form, Input, Segmented, Typography, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CustomerAuthCard() {
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

    message.success(mode === "login" ? "登录成功" : "注册成功");
    router.push("/account");
    router.refresh();
    setLoading(false);
  };

  return (
    <Card className="shadow-sm" styles={{ body: { padding: 32 } }}>
      <Typography.Title level={2}>会员登录 / 注册</Typography.Title>
      <Typography.Paragraph type="secondary">
        使用邮箱和密码完成注册登录，不需要邮箱验证。登录后可在账号中心修改密码。
      </Typography.Paragraph>
      <Segmented
        block
        className="mb-6"
        onChange={(value) => setMode(value as "login" | "register")}
        options={[
          { label: "邮箱登录", value: "login" },
          { label: "注册账号", value: "register" },
        ]}
        value={mode}
      />
      <Form layout="vertical" onFinish={submit} size="large">
        {mode === "register" ? (
          <Form.Item
            label="昵称"
            name="name"
            rules={[{ required: true, message: "请输入昵称" }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>
        ) : null}
        <Form.Item
          label="邮箱"
          name="email"
          rules={[
            { required: true, message: "请输入邮箱" },
            { type: "email", message: "邮箱格式不正确" },
          ]}
        >
          <Input placeholder="name@example.com" />
        </Form.Item>
        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: "请输入密码" }, { min: 6, message: "密码至少 6 位" }]}
        >
          <Input.Password placeholder="请输入密码" />
        </Form.Item>
        <Button block htmlType="submit" loading={loading} type="primary">
          {mode === "login" ? "登录" : "注册并登录"}
        </Button>
      </Form>
    </Card>
  );
}
