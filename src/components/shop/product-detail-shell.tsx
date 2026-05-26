"use client";

import { message } from "antd";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useCart } from "@/components/cart/cart-provider";
import { useLocale } from "@/components/providers/locale-provider";
import { formatCurrency } from "@/lib/format";
import type { Category, Product } from "@/types/store";

function calcDiscountMeta(original: number, current: number) {
  if (!original || original <= current) return null;

  return {
    rate: Math.round((current / original) * 10),
    percentOff: Math.round((1 - current / original) * 100),
  };
}

export function ProductDetailShell({
  product,
  category,
}: {
  product: Product;
  category?: Category;
}) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [, contextHolder] = message.useMessage();

  const discount = useMemo(() => {
    return product.originalPrice ? calcDiscountMeta(product.originalPrice, product.price) : null;
  }, [product.originalPrice, product.price]);

  const soldOutLabel = locale === "zh-CN" ? "已售罄" : "Sold out";

  const handleAdd = () => {
    if (adding || product.inventory <= 0) return;
    setAdding(true);
    addItem(product);
    message.success({ content: t("store.addSuccess", { name: product.name }), duration: 1.5 });
    setTimeout(() => setAdding(false), 600);
  };

  return (
    <div className="tm-shell" data-testid="product-detail">
      {contextHolder}

      <nav className="cart-breadcrumb product-breadcrumb">
        <Link href="/">{t("common.home")}</Link>
        <span className="separator">/</span>
        <span className="current">{t("common.viewDetails")}</span>
        {category?.name ? (
          <>
            <span className="separator">/</span>
            <span>{category.name}</span>
          </>
        ) : null}
      </nav>

      <div className="product-detail-layout">
        <section className="product-detail-media" data-testid="product-image">
          <div className="product-detail-media__inner">
            {!imgError ? (
              <Image
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                src={product.imageUrl || "https://via.placeholder.com/800x600?text=No+Image"}
                style={{ objectFit: "cover" }}
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="product-detail-media__fallback">{t("store.noImage")}</div>
            )}

            <div className="product-detail-media__tags">
              {discount ? (
                <span className="tag-discount">
                  {locale === "zh-CN"
                    ? t("store.discountRate", { rate: discount.rate })
                    : t("store.discountOff", { percent: discount.percentOff })}
                </span>
              ) : null}
              {product.badge ? <span className="tag-badge">{product.badge}</span> : null}
            </div>

            <div className="product-detail-media__stock">
              <span className="tag-stock">{t("store.inventory", { count: product.inventory })}</span>
            </div>
          </div>
        </section>

        <section className="product-detail-info">
          <p className="product-detail-brand">
            {product.brand}
            {product.colorway ? ` / ${product.colorway}` : ""}
          </p>

          <h1 className="product-detail-title" data-testid="product-title">
            {product.name}
          </h1>

          <div className="product-detail-price">
            <span className="product-detail-price__current">
              {formatCurrency(product.price, locale)}
            </span>
            {product.originalPrice ? (
              <span className="product-detail-price__original">
                {formatCurrency(product.originalPrice, locale)}
              </span>
            ) : null}
          </div>

          <p className="product-detail-desc">{product.description}</p>

          <div className="product-detail-meta">
            <div className="product-detail-meta__title">{locale === "zh-CN" ? "商品信息" : "Details"}</div>
            <div className="product-detail-meta__grid">
              <div className="product-detail-meta__row">
                <span className="product-detail-meta__label">{locale === "zh-CN" ? "分类" : "Category"}</span>
                <span className="product-detail-meta__value">{category?.name ?? "-"}</span>
              </div>
              <div className="product-detail-meta__row">
                <span className="product-detail-meta__label">{locale === "zh-CN" ? "库存" : "Inventory"}</span>
                <span className="product-detail-meta__value">{product.inventory}</span>
              </div>
              <div className="product-detail-meta__row">
                <span className="product-detail-meta__label">{locale === "zh-CN" ? "商品编号" : "Product ID"}</span>
                <span className="product-detail-meta__value">{product.id}</span>
              </div>
              {product.sku ? (
                <div className="product-detail-meta__row">
                  <span className="product-detail-meta__label">SKU</span>
                  <span className="product-detail-meta__value">{product.sku}</span>
                </div>
              ) : null}
              {product.status ? (
                <div className="product-detail-meta__row">
                  <span className="product-detail-meta__label">{locale === "zh-CN" ? "状态" : "Status"}</span>
                  <span className="product-detail-meta__value">{product.status}</span>
                </div>
              ) : null}
              {product.slug ? (
                <div className="product-detail-meta__row">
                  <span className="product-detail-meta__label">{locale === "zh-CN" ? "Slug" : "Slug"}</span>
                  <span className="product-detail-meta__value">{product.slug}</span>
                </div>
              ) : null}
            </div>
          </div>

          {product.sizes?.length ? (
            <div className="product-detail-sizes">
              <div className="product-detail-sizes__title">{locale === "zh-CN" ? "尺码" : "Sizes"}</div>
              <div className="product-detail-sizes__list">
                {product.sizes.map((size) => (
                  <span key={size} className="product-detail-size">
                    {size}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="product-detail-cta">
            <button
              className="btn-cart"
              disabled={adding || product.inventory <= 0}
              onClick={handleAdd}
              type="button"
            >
              <ShoppingCart size={14} strokeWidth={2} />
              {product.inventory <= 0 ? soldOutLabel : adding ? t("store.added") : t("store.addToCart")}
            </button>

            <Link className="product-detail-back" href="/">
              ← {t("common.backHome")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
