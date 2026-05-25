import Link from "next/link";

import { getSessionUser } from "@/lib/auth";
import { isDatabaseConfigured, readOrdersByUserId } from "@/lib/database";
import { formatCurrency } from "@/lib/format";
import type { Order } from "@/types/store";

export const dynamic = "force-dynamic";

function getOrderStatusMeta(status: string) {
  const normalizedStatus = status.toUpperCase();

  switch (normalizedStatus) {
    case "PENDING":
      return {
        label: "待处理",
        className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
      };
    case "PAID":
      return {
        label: "已支付",
        className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      };
    case "SHIPPED":
      return {
        label: "已发货",
        className: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
      };
    case "COMPLETED":
      return {
        label: "已完成",
        className: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
      };
    case "CANCELLED":
      return {
        label: "已取消",
        className: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
      };
    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
      };
  }
}

function formatOrderTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    hour12: false,
  });
}

function OrderCard({ order }: { order: Order }) {
  const statusMeta = getOrderStatusMeta(order.status);

  return (
    <article className="orders-card">
      <div className="orders-card__top">
        <div className="orders-card__meta">
          <p className="orders-card__kicker">Order</p>
          <h2 className="orders-card__id">{order.id}</h2>
          <p className="orders-card__time">下单时间: {formatOrderTime(order.createdAt)}</p>
        </div>
        <div className="orders-card__summary">
          <span className={`orders-card__status ${statusMeta.className}`}>
            {statusMeta.label}
          </span>
          <div className="orders-card__total">
            <p className="orders-card__total-label">Total</p>
            <p className="orders-card__total-value">{formatCurrency(order.totalAmount)}</p>
          </div>
        </div>
      </div>

      <div className="orders-card__content">
        <div className="orders-card__items">
          {order.items.map((item) => (
            <div className="orders-line" key={item.id}>
              <div className="orders-line__info">
                <p className="orders-line__name">{item.productName}</p>
                <p className="orders-line__meta">
                  单价 {formatCurrency(item.productPrice)} · 数量 {item.quantity}
                </p>
              </div>
              <p className="orders-line__total">{formatCurrency(item.lineTotal)}</p>
            </div>
          ))}
        </div>

        <div className="orders-card__aside">
          <section className="orders-block orders-block--muted">
            <p className="orders-block__title">收货信息</p>
            <div className="orders-block__body">
              <p>收货人: {order.receiverName}</p>
              <p>电话: {order.receiverPhone}</p>
              <p>邮箱: {order.receiverEmail}</p>
              <p>地址: {order.receiverAddress}</p>
            </div>
          </section>

          <section className="orders-block">
            <p className="orders-block__title">订单备注</p>
            <p className="orders-block__body">{order.note || "暂无备注"}</p>
          </section>
        </div>
      </div>
    </article>
  );
}

export default async function OrdersPage() {
  const user = await getSessionUser();

  if (!isDatabaseConfigured()) {
    return (
      <div className="tm-shell flex flex-col gap-8 py-10 lg:py-14">
        <section className="tm-panel p-8">
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
      <div className="tm-shell flex flex-col gap-8 py-10 lg:py-14">
        <section className="tm-panel p-8">
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
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const latestOrder = orders[0];

  return (
    <div className="tm-shell orders-page">
      <section className="orders-hero">
        <div className="orders-hero__inner">
          <div className="orders-hero__content">
            <p className="tm-kicker text-slate-300">Orders</p>
            <h1 className="orders-hero__title">我的订单</h1>
            <p className="orders-hero__desc">已登录账号: {user.email}</p>
          </div>
          <div className="orders-stats">
            <div className="orders-stat">
              <p className="orders-stat__label">订单数</p>
              <p className="orders-stat__value">{orders.length}</p>
            </div>
            <div className="orders-stat">
              <p className="orders-stat__label">累计金额</p>
              <p className="orders-stat__value">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="orders-stat">
              <p className="orders-stat__label">最近下单</p>
              <p className="orders-stat__value orders-stat__value--time">
                {latestOrder ? formatOrderTime(latestOrder.createdAt) : "暂无记录"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="orders-list">
        {orders.length === 0 ? (
          <div className="orders-empty">
            <p className="orders-empty__title">你还没有订单</p>
            <p className="orders-empty__desc">去首页挑选商品后，在购物车页面完成下单。</p>
            <Link
              className="orders-empty__action"
              href="/"
            >
              去逛商城
            </Link>
          </div>
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
        )}
      </section>
    </div>
  );
}
