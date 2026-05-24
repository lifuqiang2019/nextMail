"use client";

import { Button, Card, Descriptions, Form, Input, Typography, message } from "antd";
import { useState } from "react";

import type { CustomerProfile } from "@/types/store";

export function ChangePasswordCard({ user }: { user: CustomerProfile }) {
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
    message.success("密码修改成功");
    setLoading(false);
  };

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:px-8 lg:grid-cols-[1fr_1.2fr]">
      <Card>
        <Typography.Title level={3}>账号信息</Typography.Title>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="昵称">{user.name}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
          <Descriptions.Item label="登录方式">邮箱 + 密码</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card>
        <Typography.Title level={3}>修改密码</Typography.Title>
        <Form layout="vertical" onFinish={submit} size="large">
          <Form.Item
            label="当前密码"
            name="currentPassword"
            rules={[{ required: true, message: "请输入当前密码" }]}
          >
            <Input.Password placeholder="请输入当前密码" />
          </Form.Item>
          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[{ required: true, message: "请输入新密码" }, { min: 6, message: "密码至少 6 位" }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Button htmlType="submit" loading={loading} type="primary">
            保存新密码
          </Button>
        </Form>
      </Card>
    </div>
  );
}
