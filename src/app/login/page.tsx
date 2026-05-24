"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";

type AuthMode = "login" | "register";

const modeText: Record<AuthMode, string> = {
  login: "登录",
  register: "注册",
};

export default function LoginPage() {
  const router = useRouter();
  const { refreshSession, user } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const helperText = useMemo(() => {
    if (user) {
      return `当前已登录为 ${user.email}`;
    }

    return mode === "login"
      ? "使用邮箱和密码登录后即可下单。"
      : "注册成功后会自动登录。";
  }, [mode, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: mode === "register" ? name : undefined,
          email,
          password,
        }),
      });

      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message || `${modeText[mode]}失败`);
      }

      await refreshSession();
      router.push("/cart");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `${modeText[mode]}失败`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Account</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight">邮箱登录 / 注册</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
          当前版本使用邮箱和密码进行注册登录，后续可以继续扩展验证码登录、找回密码和会员中心。
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex gap-3">
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              onClick={() => setMode("login")}
              type="button"
            >
              登录
            </button>
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                mode === "register"
                  ? "bg-slate-950 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
              onClick={() => setMode("register")}
              type="button"
            >
              注册
            </button>
          </div>

          <p className="mt-5 text-sm text-slate-500">{helperText}</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">昵称</span>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="请输入昵称"
                  value={name}
                />
              </label>
            ) : null}

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">邮箱</span>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="请输入邮箱"
                type="email"
                value={email}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">密码</span>
              <input
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="请输入密码"
                type="password"
                value={password}
              />
            </label>

            <button
              className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "提交中..." : mode === "login" ? "立即登录" : "创建账号"}
            </button>
          </form>

          <div
            className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
              message ? "bg-rose-50 text-rose-600" : "bg-slate-100 text-slate-600"
            }`}
          >
            {message || "登录后可在购物车页提交订单。"}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">功能说明</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">当前账号能力</h2>
          <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
            <p>1. 支持邮箱 + 密码注册</p>
            <p>2. 登录后可以提交订单并查看自己的订单列表</p>
            <p>3. 登录态通过 HttpOnly Cookie 保存</p>
            <p>4. 未配置 MySQL 时，接口会给出明确提示，不会影响现有商城浏览</p>
          </div>
        </div>
      </section>
    </div>
  );
}
