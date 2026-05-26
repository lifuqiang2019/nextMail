"use client";

import { message } from "antd";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, MouseEvent } from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useLocale } from "@/components/providers/locale-provider";
import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";
import type { FilterGroup, Product, StoreData } from "@/types/store";

function calcDiscountMeta(original: number, current: number) {
  if (!original || original <= current) return null;

  return {
    rate: Math.round((current / original) * 10),
    percentOff: Math.round((1 - current / original) * 100),
  };
}

function ProductCard({
  product,
  isMobile,
  prioritizeImage = false,
}: {
  product: Product;
  isMobile: boolean;
  prioritizeImage?: boolean;
}) {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [dots, setDots] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleAdd = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const { clientX, clientY } = e;
    const dotId = Date.now();
    setDots((prev) => [...prev, { id: dotId, x: clientX, y: clientY }]);

    setAdding(true);
    addItem(product);
    message.success({ content: t("store.addSuccess", { name: product.name }), duration: 1.5 });

    setTimeout(() => {
      setDots((prev) => prev.filter((d) => d.id !== dotId));
    }, 500);

    setTimeout(() => setAdding(false), 800);
  };

  const discount = product.originalPrice ? calcDiscountMeta(product.originalPrice, product.price) : null;

  return (
    <Link className="product-card" href={`/products/${product.id}`}>
      {/* 飞行动画点 */}
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="flying-dot"
          style={{
            left: dot.x - 8,
            top: dot.y - 8,
            "--tx": isMobile ? "28vw" : "42vw",
            "--ty": isMobile ? "42vh" : "-34vh",
          } as CSSProperties}
        />
      ))}
      
      {/* 商品图片区域 */}
      <div className="product-card__image">
        {!imgError ? (
          <Image
            alt={product.name}
            fill
            fetchPriority={prioritizeImage ? "high" : undefined}
            loading={prioritizeImage ? "eager" : undefined}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            src={product.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"}
            style={{ objectFit: "cover" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#d0d0d0] text-sm">
            {t("store.noImage")}
          </div>
        )}

        {discount && (
          <div style={{ position: "absolute", left: 10, top: 10 }}>
            <span className="tag-discount">
              {locale === "zh-CN"
                ? t("store.discountRate", { rate: discount.rate })
                : t("store.discountOff", { percent: discount.percentOff })}
            </span>
          </div>
        )}

        {product.badge && (
          <div style={{ position: "absolute", left: 10, top: 40 }}>
            <span className="tag-badge">{product.badge}</span>
          </div>
        )}

        <div style={{ position: "absolute", right: 10, bottom: 10 }}>
          <span className="tag-stock">{t("store.inventory", { count: product.inventory })}</span>
        </div>
      </div>

      <div className="product-card__info">
        <p className="product-card__brand">
          {product.brand} / {product.colorway}
        </p>
        <p className="product-card__name">{product.name}</p>

        <div className="product-card__price">
          <span className="product-card__price-current">{formatCurrency(product.price, locale)}</span>
          {product.originalPrice && (
            <span className="product-card__price-original">
              {formatCurrency(product.originalPrice, locale)}
            </span>
          )}
        </div>

        <p className="product-card__sizes">{t("store.sizes", { sizes: product.sizes.join(" / ") })}</p>

        <div className="product-card__action">
          <button
            className="btn-cart"
            disabled={adding}
            onClick={handleAdd}
            type="button"
          >
            <ShoppingCart size={14} strokeWidth={2} />
            {adding ? t("store.added") : t("store.addToCart")}
          </button>
        </div>
      </div>
    </Link>
  );
}

export function StoreShell({
  initialData,
  isMobile,
  searchQuery = "",
}: {
  initialData: StoreData;
  isMobile: boolean;
  searchQuery?: string;
}) {
  const { t } = useTranslation();
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [, contextHolder] = message.useMessage();
  const eagerImageCount = isMobile ? 0 : 4;

  const products = useMemo(() => {
    return initialData.products.filter((product) => {
      // 1. 关键词筛选
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = product.name.toLowerCase().includes(q);
        const matchBrand = product.brand.toLowerCase().includes(q);
        const matchDesc = product.description?.toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchDesc) {
          return false;
        }
      }

      // 2. 分类组筛选
      return initialData.filterGroups.every((group) => {
        const selectedOptionId = selectedFilters[group.id];
        if (!selectedOptionId) return true;
        return product.filterOptionIds.includes(selectedOptionId);
      });
    });
  }, [selectedFilters, initialData.filterGroups, initialData.products, searchQuery]);

  const filterGroups = initialData.filterGroups.filter((g) => g.isActive !== false);

  const selectFilter = (group: FilterGroup, optionId?: string) => {
    setSelectedFilters((current) => {
      if (!optionId) {
        const next = { ...current };
        delete next[group.id];
        return next;
      }
      return { ...current, [group.id]: optionId };
    });
  };

  const hasActiveFilters = Object.keys(selectedFilters).length > 0;

  const activeFilterCount = Object.keys(selectedFilters).length;

  return (
    <div className={`tm-shell store-page${isMobile ? "" : " store-page--desktop"}`}>
      {contextHolder}

      {!isMobile ? (
        <section className="store-hero">
          <div className="store-hero__content">
            <p className="store-hero__kicker">NEW SEASON</p>
            <h1 className="store-hero__title">{initialData.settings.heroTitle}</h1>
            <p className="store-hero__subtitle">{initialData.settings.heroSubtitle}</p>
            {initialData.settings.heroNotice ? (
              <p className="store-hero__notice">{initialData.settings.heroNotice}</p>
            ) : null}
          </div>
          <div className="store-hero__stats">
            <div className="store-hero__stat">
              <span className="store-hero__stat-value">{initialData.products.length}</span>
              <span className="store-hero__stat-label">{t("store.productsOnSale")}</span>
            </div>
            <div className="store-hero__stat">
              <span className="store-hero__stat-value">{filterGroups.length}</span>
              <span className="store-hero__stat-label">{t("store.filterDimensions")}</span>
            </div>
            <div className="store-hero__stat">
              <span className="store-hero__stat-value">{products.length}</span>
              <span className="store-hero__stat-label">{t("store.currentDisplay")}</span>
            </div>
          </div>
        </section>
      ) : null}

      <div className={isMobile ? undefined : "store-layout"}>
        <section className={`filter-section${isMobile ? "" : " filter-section--sidebar"}`}>
          {!isMobile ? (
            <header className="filter-header filter-header--sidebar">
              <h2 className="filter-title">{t("store.filterTitle")}</h2>
              {hasActiveFilters ? (
                <span className="filter-active-badge">{t("store.selectedCount", { count: activeFilterCount })}</span>
              ) : null}
            </header>
          ) : null}

          <div>
            {filterGroups.map((group) => (
              <div key={group.id} className="filter-group">
                <h3 className="filter-label">{group.name}</h3>
                <div className="filter-options">
                  <button
                    className={`filter-btn${!selectedFilters[group.id] ? " filter-btn--active" : ""}`}
                    onClick={() => selectFilter(group)}
                    type="button"
                  >
                    {t("store.allProducts")}
                  </button>
                  {group.options.filter((o) => o.isActive !== false).map((option) => (
                    <button
                      key={option.id}
                      className={`filter-btn${selectedFilters[group.id] === option.id ? " filter-btn--active" : ""}`}
                      onClick={() => selectFilter(group, option.id)}
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className={isMobile ? undefined : "store-main"}>
          {!isMobile ? (
            <div className="store-toolbar">
              <div>
                <h2 className="store-toolbar__title">{t("store.toolbarTitle")}</h2>
                <p className="store-toolbar__desc">
                  {t("store.toolbarDesc", { count: products.length })}
                  {activeFilterCount > 0
                    ? t("store.toolbarSelectedSuffix", { count: activeFilterCount })
                    : ""}
                </p>
              </div>
              {hasActiveFilters ? (
                <button
                  className="filter-clear-btn store-toolbar__clear"
                  onClick={() => setSelectedFilters({})}
                  type="button"
                >
                  <span>↺</span> {t("common.clearFilters")}
                </button>
              ) : null}
            </div>
          ) : null}

          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🛒</div>
              <p className="empty-state__title">{t("store.emptyTitle")}</p>
              <p className="empty-state__desc">{t("store.emptyDesc")}</p>
              <div className="empty-state__action">
                <button
                  className="tm-btn-primary"
                  onClick={() => setSelectedFilters({})}
                  style={{ padding: "10px 28px" }}
                  type="button"
                >
                  {t("common.clearFilters")}
                </button>
              </div>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  isMobile={isMobile}
                  prioritizeImage={index < eagerImageCount}
                  product={product}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
