import Link from "next/link";

import { getCurrentCustomerProfile } from "@/lib/auth/customer";
import { isDatabaseConfigured, readOrdersByUserId } from "@/lib/database";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getServerTranslator } from "@/lib/i18n/server";
import { localizeOrders } from "@/lib/store-localization";
import type { Order } from "@/types/store";

export const dynamic = "force-dynamic";

function getOrderStatusMeta(status: string, t: (key: string) => string) {
  const normalizedStatus = status.toUpperCase();

  switch (normalizedStatus) {
    case "PENDING":
      return {
        label: t("status.pending"),
        className: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
      };
    case "PAID":
      return {
        label: t("status.paid"),
        className: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
      };
    case "SHIPPED":
      return {
        label: t("status.shipped"),
        className: "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200",
      };
    case "COMPLETED":
      return {
        label: t("status.completed"),
        className: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
      };
    case "CANCELLED":
      return {
        label: t("status.cancelled"),
        className: "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200",
      };
    default:
      return {
        label: status,
        className: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
      };
  }
}

function OrderCard({
  order,
  locale,
  t,
}: {
  order: Order;
  locale: string;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const statusMeta = getOrderStatusMeta(order.status, t);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <article className="orders-card">
      <div className="orders-card__top">
        <div className="orders-card__meta">
          <p className="orders-card__kicker">Order</p>
          <h2 className="orders-card__id">{order.id}</h2>
          <div className="orders-card__meta-row">
            <p className="orders-card__time">
              {t("orders.placedAt", { time: formatDateTime(order.createdAt, locale) })}
            </p>
            <span className="orders-card__count">{t("orders.itemCount", { count: itemCount })}</span>
          </div>
        </div>
        <div className="orders-card__summary">
          <span className={`orders-card__status ${statusMeta.className}`}>{statusMeta.label}</span>
          <div className="orders-card__total">
            <p className="orders-card__total-label">{t("orders.totalLabel")}</p>
            <p className="orders-card__total-value">{formatCurrency(order.totalAmount, locale)}</p>
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
                  {t("orders.unitPriceQuantity", {
                    price: formatCurrency(item.productPrice, locale),
                    quantity: item.quantity,
                  })}
                </p>
              </div>
              <p className="orders-line__total">{formatCurrency(item.lineTotal, locale)}</p>
            </div>
          ))}
        </div>

        <div className="orders-card__aside">
          <section className="orders-block orders-block--muted">
            <p className="orders-block__title">{t("orders.receiverInfo")}</p>
            <div className="orders-block__body orders-block__rows">
              <div className="orders-block__row">
                <span className="orders-block__label">{t("orders.receiver")}</span>
                <span>{order.receiverName}</span>
              </div>
              <div className="orders-block__row">
                <span className="orders-block__label">{t("orders.phone")}</span>
                <span>{order.receiverPhone}</span>
              </div>
              <div className="orders-block__row">
                <span className="orders-block__label">{t("orders.email")}</span>
                <span>{order.receiverEmail}</span>
              </div>
              <div className="orders-block__row orders-block__row--stack">
                <span className="orders-block__label">{t("orders.address")}</span>
                <span>{order.receiverAddress}</span>
              </div>
            </div>
          </section>

          <section className="orders-block">
            <p className="orders-block__title">{t("orders.orderNote")}</p>
            <p className="orders-block__body">{order.note || t("orders.noNote")}</p>
          </section>
        </div>
      </div>
    </article>
  );
}

export default async function OrdersPage() {
  const { locale, t } = await getServerTranslator();
  const user = await getCurrentCustomerProfile();

  if (!isDatabaseConfigured()) {
    return (
      <div className="tm-shell orders-page">
        <section className="orders-notice">
          <p className="orders-notice__kicker">Orders</p>
          <h1 className="orders-notice__title">{t("orders.title")}</h1>
          <p className="orders-notice__desc">{t("orders.dbNotConfiguredDesc")}</p>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="tm-shell orders-page">
        <section className="orders-notice">
          <p className="orders-notice__kicker">Orders</p>
          <h1 className="orders-notice__title">{t("orders.title")}</h1>
          <p className="orders-notice__desc">{t("orders.loginRequiredDesc")}</p>
          <Link className="orders-action mt-5" href="/login">
            {t("orders.goLogin")}
          </Link>
        </section>
      </div>
    );
  }

  let orders: Order[] = [];

  try {
    orders = await readOrdersByUserId(user.id);
  } catch {
    return (
      <div className="tm-shell orders-page">
        <section className="orders-notice">
          <p className="orders-notice__kicker">Orders</p>
          <h1 className="orders-notice__title">{t("orders.title")}</h1>
          <p className="orders-notice__desc">{t("orders.dbBusyDesc", { email: user.email })}</p>
          <Link className="orders-action mt-5" href="/">
            {t("common.backHome")}
          </Link>
        </section>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const latestOrder = orders[0];
  const localizedOrders = localizeOrders(orders, locale);

  return (
    <div className="tm-shell orders-page">
      <section className="orders-hero">
        <div className="orders-hero__inner">
          <div className="orders-hero__content">
            <p className="tm-kicker text-slate-300">Orders</p>
            <h1 className="orders-hero__title">{t("orders.title")}</h1>
            <p className="orders-hero__desc">{t("orders.loggedInAs", { email: user.email })}</p>
          </div>
          <div className="orders-stats">
            <div className="orders-stat">
              <p className="orders-stat__label">{t("orders.orderCount")}</p>
              <p className="orders-stat__value">{orders.length}</p>
            </div>
            <div className="orders-stat">
              <p className="orders-stat__label">{t("orders.totalSpent")}</p>
              <p className="orders-stat__value">{formatCurrency(totalSpent, locale)}</p>
            </div>
            <div className="orders-stat">
              <p className="orders-stat__label">{t("orders.latestOrder")}</p>
              <p className="orders-stat__value orders-stat__value--time">
                {latestOrder ? formatDateTime(latestOrder.createdAt, locale) : t("orders.noRecord")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="orders-list">
        {orders.length === 0 ? (
          <div className="orders-empty">
            <p className="orders-empty__title">{t("orders.emptyTitle")}</p>
            <p className="orders-empty__desc">{t("orders.emptyDesc")}</p>
            <Link className="orders-action" href="/">
              {t("orders.goBrowse")}
            </Link>
          </div>
        ) : (
          localizedOrders.map((order) => <OrderCard key={order.id} locale={locale} order={order} t={t} />)
        )}
      </section>
    </div>
  );
}
