import Link from "next/link";

import { getSessionUser } from "@/lib/auth";
import { isDatabaseConfigured, readOrdersByUserId } from "@/lib/database";
import { formatCurrency } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const user = await getSessionUser();

  if (!isDatabaseConfigured()) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="rounded-[32px] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-950">我的订单</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            当前还没有配置 MySQL 连接串，订单功能代码已经接好，填好 `DATABASE_URL` 后即可使用。
          </p>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <section className="rounded-[32px] bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-950">我的订单</h1>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            请先登录，再查看你自己的订单记录。
          </p>
          <Link
            className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
            href="/login"
          >
            去登录
          </Link>
        </section>
      </div>
    );
  }

  const orders = await readOrdersByUserId(user.id);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:gap-8 lg:py-14">
      <section className="rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Orders</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">我的订单</h1>
        <p className="mt-3 break-all text-sm leading-7 text-slate-300 sm:text-base">
          已登录账号: {user.email}
        </p>
      </section>

      <section className="space-y-5">
        {orders.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-medium text-slate-900">你还没有订单</p>
            <p className="mt-2 text-sm text-slate-500">去首页挑选商品后，在购物车页面完成下单。</p>
            <Link
              className="mt-5 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              href="/"
            >
              去逛商城
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <article
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              key={order.id}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm text-slate-500">订单号</p>
                  <h2 className="mt-1 break-all text-base font-semibold text-slate-950 sm:text-xl">
                    {order.id}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    下单时间: {new Date(order.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
                <div className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-left sm:w-auto sm:text-right">
                  <p className="text-sm text-slate-500">订单状态</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{order.status}</p>
                  <p className="mt-2 text-xl font-semibold text-slate-950">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      className="flex flex-col gap-2 rounded-2xl border border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                      key={item.id}
                    >
                      <div>
                        <p className="font-medium text-slate-900">{item.productName}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatCurrency(item.productPrice)} x {item.quantity}
                        </p>
                      </div>
                      <span className="text-left text-sm font-semibold text-slate-900 sm:text-right">
                        {formatCurrency(item.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-sm text-slate-500">收货信息</p>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    <p>收货人: {order.receiverName}</p>
                    <p>电话: {order.receiverPhone}</p>
                    <p>邮箱: {order.receiverEmail}</p>
                    <p>地址: {order.receiverAddress}</p>
                    <p>备注: {order.note || "无"}</p>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
