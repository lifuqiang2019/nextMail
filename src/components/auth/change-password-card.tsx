"use client";

import { Card, Descriptions, Form, Input, Button, message } from "antd";
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
    message.success("密码修改成功！");
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">账号中心</h1>
        <p className="mt-1 text-sm text-gray-500">管理个人信息与安全设置</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <Card className="shadow-sm">
          <div className="mb-4 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="昵称">{user.name}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{user.email}</Descriptions.Item>
            <Descriptions.Item label="登录方式">邮箱 + 密码</Descriptions.Item>
          </Descriptions>
        </Card>

        <Card className="shadow-sm">
          <h2 className="mb-5 text-base font-bold text-gray-900">🔐 修改密码</h2>
          <Form layout="vertical" onFinish={submit} size="large">
            <Form.Item
              label="当前密码"
              name="currentPassword"
              rules={[{ required: true, message: "请输入当前密码" }]}
            >
              <Input.Password placeholder="请输入当前密码" />
            </Form.Item>
            <Form.Item
              label="新密码（至少 6 位）"
              name="newPassword"
              rules={[{ required: true, message: "请输入新密码" }, { min: 6, message: "密码至少 6 位" }]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
            <Button
              className="!rounded-lg !bg-gradient-to-r !from-orange-500 !to-red-500 !border-none !font-bold !text-white hover:!from-orange-600 hover:!to-red-600"
              htmlType="submit"
              loading={loading}
              type="primary"
            >
              保存新密码
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
}
