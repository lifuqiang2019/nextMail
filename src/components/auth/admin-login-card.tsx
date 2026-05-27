"use client";

import { Button, Card, Form, Input, Typography, message } from "antd";
import { useState } from "react";

export function AdminLoginCard() {
  const [loading, setLoading] = useState(false);

  const submit = async (values: { username: string; password: string }) => {
    setLoading(true);
    const response = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await response.json();
    if (!response.ok) {
      message.error(data.message || "登录失败");
      setLoading(false);
      return;
    }
    message.success("管理员登录成功");
    window.location.assign("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card styles={{ body: { padding: 32 } }}>
          <Typography.Title level={2}>管理员登录</Typography.Title>
          <Typography.Paragraph type="secondary">
            默认账号是 `admin`，默认密码是 `admin123`。登录后，您可以添加或编辑管理员账号。
          </Typography.Paragraph>
          <Form layout="vertical" onFinish={submit} size="large">
            <Form.Item label="用户名" name="username" rules={[{ required: true, message: "请输入用户名" }]}>
              <Input placeholder="admin" />
            </Form.Item>
            <Form.Item label="密码" name="password" rules={[{ required: true, message: "请输入密码" }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
            <Button block htmlType="submit" loading={loading} type="primary">
              登录管理后台
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
