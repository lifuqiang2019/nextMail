"use client";

import { Button, Card, Form, Input, Typography, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminLoginCard() {
  const router = useRouter();
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
    router.push("/admin");
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12">
      <Card styles={{ body: { padding: 32 } }}>
        <Typography.Title level={2}>后台登录</Typography.Title>
        <Typography.Paragraph type="secondary">
          初始账号为 `admin`，初始密码为 `admin123`。登录后可在后台新增或修改管理员账号。
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={submit} size="large">
          <Form.Item label="账号" name="username" rules={[{ required: true, message: "请输入账号" }]}>
            <Input placeholder="admin" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: "请输入密码" }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Button block htmlType="submit" loading={loading} type="primary">
            登录后台
          </Button>
        </Form>
      </Card>
    </div>
  );
}
