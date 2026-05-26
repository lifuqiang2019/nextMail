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
      message.error(data.message || "Sign-in failed");
      setLoading(false);
      return;
    }
    message.success("Admin signed in successfully");
    window.location.assign("/admin");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card styles={{ body: { padding: 32 } }}>
          <Typography.Title level={2}>Admin Sign In</Typography.Title>
          <Typography.Paragraph type="secondary">
            The default account is `admin` and the default password is `admin123`. After signing in, you can add or edit admin accounts.
          </Typography.Paragraph>
          <Form layout="vertical" onFinish={submit} size="large">
            <Form.Item label="Username" name="username" rules={[{ required: true, message: "Please enter a username" }]}>
              <Input placeholder="admin" />
            </Form.Item>
            <Form.Item label="Password" name="password" rules={[{ required: true, message: "Please enter a password" }]}>
              <Input.Password placeholder="Enter your password" />
            </Form.Item>
            <Button block htmlType="submit" loading={loading} type="primary">
              Sign In to Admin
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
