"use client";

import { message } from "antd";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import type { CSSProperties, MouseEvent } from "react";
import { useMemo, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import type { FilterGroup, Product, StoreData } from "@/types/store";

function calcDiscount(original: number, current: number) {
  if (!original || original <= current) return null;
  return Math.round((1 - current / original) * 10);
}

function ProductCard({ product, isMobile }: { product: Product; isMobile: boolean }) {
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
    message.success({ content: `"${product.name}" 已加入购物车`, duration: 1.5 });

    setTimeout(() => {
      setDots((prev) => prev.filter((d) => d.id !== dotId));
    }, 500);

    setTimeout(() => setAdding(false), 800);
  };

  const discount = product.originalPrice ? calcDiscount(product.originalPrice, product.price) : null;

  return (
    <div className="product-card">
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
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            src={product.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"}
            style={{ objectFit: "cover" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#d0d0d0] text-sm">
            暂无图片
          </div>
        )}
        
        {/* 折扣标签 */}
        {discount && (
          <div style={{ position: 'absolute', left: 10, top: 10 }}>
            <span className="tag-discount">{discount}折</span>
          </div>
        )}
        
        {/* 徽章标签 */}
        {product.badge && (
          <div style={{ position: 'absolute', left: 10, top: 40 }}>
            <span className="tag-badge">{product.badge}</span>
          </div>
        )}
        
        {/* 库存标签 */}
        <div style={{ position: 'absolute', right: 10, bottom: 10 }}>
          <span className="tag-stock">库存 {product.inventory}</span>
        </div>
      </div>

      {/* 商品信息区域 */}
      <div className="product-card__info">
        <p className="product-card__brand">{product.brand} / {product.colorway}</p>
        <p className="product-card__name">{product.name}</p>

        <div className="product-card__price">
          <span className="product-card__price-current">¥{product.price}</span>
          {product.originalPrice && (
            <span className="product-card__price-original">¥{product.originalPrice}</span>
          )}
        </div>

        <p className="product-card__sizes">尺码：{product.sizes.join(" / ")}</p>

        <div className="product-card__action">
          <button
            className="btn-cart"
            disabled={adding}
            onClick={handleAdd}
            type="button"
          >
            <ShoppingCart size={14} strokeWidth={2} />
            {adding ? "已加入" : "加入购物车"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StoreShell({ initialData, isMobile }: { initialData: StoreData; isMobile: boolean }) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [, contextHolder] = message.useMessage();

  const products = useMemo(() => {
    return initialData.products.filter((product) => {
      return initialData.filterGroups.every((group) => {
        const selectedOptionId = selectedFilters[group.id];
        if (!selectedOptionId) return true;
        return product.filterOptionIds.includes(selectedOptionId);
      });
    });
  }, [selectedFilters, initialData.filterGroups, initialData.products]);

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

  return (
    <div className={`tm-shell store-page`}>
      {contextHolder}

      {/* 筛选区域 */}
      <section className="filter-section">
        {!isMobile && hasActiveFilters ? (
          <header className="filter-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 className="filter-title">商品筛选</h2>
              <span style={{
                borderRadius: 9999,
                background: '#fff5ee',
                padding: '3px 10px',
                fontSize: 11,
                fontWeight: 500,
                color: '#ff6b35'
              }}>已筛选</span>
            </div>
            <button
              className="filter-clear-btn"
              onClick={() => setSelectedFilters({})}
              type="button"
            >
              <span>↺</span> 清除全部
            </button>
          </header>
        ) : null}

        <div>
          {filterGroups.map((group) => (
            <div key={group.id} className="filter-group">
              <h3 className="filter-label">{group.name}</h3>
              <div className="filter-options">
                <button
                  className={`filter-btn${!selectedFilters[group.id] ? ' filter-btn--active' : ''}`}
                  onClick={() => selectFilter(group)}
                  type="button"
                >
                  全部
                </button>
                {group.options.filter((o) => o.isActive !== false).map((option) => (
                  <button
                    key={option.id}
                    className={`filter-btn${selectedFilters[group.id] === option.id ? ' filter-btn--active' : ''}`}
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

      {/* 商品列表 */}
      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🛒</div>
          <p className="empty-state__title">暂无符合条件的商品</p>
          <p className="empty-state__desc">试试调整筛选条件，或者清空当前筛选后查看全部商品。</p>
          <div className="empty-state__action">
            <button
              className="tm-btn-primary"
              onClick={() => setSelectedFilters({})}
              style={{ padding: '10px 28px' }}
              type="button"
            >
              清除筛选
            </button>
          </div>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product.id} isMobile={isMobile} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
