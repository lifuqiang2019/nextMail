"use client";

import { Button, Card, Form, Input, Segmented, message } from "antd";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Mail, Lock, User } from "lucide-react";

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

    message.success(mode === "login" ? "登录成功，欢迎回来！" : "注册成功，欢迎加入！");
    router.push("/");
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">欢迎登录 {process.env.NEXT_PUBLIC_STORE_NAME || "商城"}</h1>
        <p className="mt-2 text-sm text-gray-500">登录后可管理购物车、收藏商品和查看订单</p>
      </div>

      <Card className="shadow-md" styles={{ body: { padding: "28px 24px" } }}>
        <Segmented
          block
          className="mb-6"
          onChange={(value) => setMode(value as "login" | "register")}
          options={[
            { label: "🔑 账号登录", value: "login" },
            { label: "📝 快速注册", value: "register" },
          ]}
          value={mode}
        />

        <Form layout="vertical" onFinish={submit} size="large">
          {mode === "register" && (
            <Form.Item
              label="昵称"
              name="name"
              rules={[{ required: true, message: "请输入昵称" }]}
            >
              <Input
                prefix={<User size={15} className="text-gray-400" />}
                placeholder="给自己取个昵称吧"
              />
            </Form.Item>
          )}
          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "邮箱格式不正确" },
            ]}
          >
            <Input
              prefix={<Mail size={15} className="text-gray-400" />}
              placeholder="name@example.com"
            />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少 6 位" },
            ]}
          >
            <Input.Password
              prefix={<Lock size={15} className="text-gray-400" />}
              placeholder="请输入密码"
            />
          </Form.Item>
          <Button
            block
            className="!rounded-lg !bg-gradient-to-r !from-orange-500 !to-red-500 !border-none !py-5 !text-base !font-bold !text-white hover:!from-orange-600 hover:!to-red-600"
            htmlType="submit"
            loading={loading}
            type="primary"
          >
            {mode === "login" ? "登 录" : "注册并登录"}
          </Button>
        </Form>

        <div className="mt-4 border-t border-gray-100 pt-4 text-center">
          <p className="text-xs text-gray-400">
            {mode === "login" ? "还没有账号？" : "已有账号？"}
            <button
              className="ml-1 font-medium text-orange-500 transition hover:underline"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              type="button"
            >
              {mode === "login" ? "立即注册" : "立即登录"}
            </button>
          </p>
        </div>
      </Card>

      <p className="mt-6 text-center text-xs text-gray-400">
        登录即表示同意我们的{" "}
        <span className="text-orange-500">《用户协议》</span> 和{" "}
        <span className="text-orange-500">《隐私政策》</span>
      </p>
    </div>
  );
}
