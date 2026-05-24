"use client";

import { message } from "antd";
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
    }, 600);

    setTimeout(() => setAdding(false), 800);
  };

  const discount = product.originalPrice ? calcDiscount(product.originalPrice, product.price) : null;

  return (
    <div className="relative flex flex-col overflow-hidden rounded-[22px] border border-white/80 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(15,23,42,0.09)]">
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="flying-dot"
          style={{
            left: dot.x - 10,
            top: dot.y - 10,
            "--tx": isMobile ? "28vw" : "42vw",
            "--ty": isMobile ? "42vh" : "-34vh",
          } as CSSProperties}
        />
      ))}
      <div className="relative aspect-[1/1] overflow-hidden bg-[#f8fafc]">
        {!imgError ? (
          <Image
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            src={product.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"}
            style={{ objectFit: "cover" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <span>暂无图片</span>
          </div>
        )}
        {discount && (
          <div className="absolute left-0 top-0">
            <div className="tm-badge">{discount}折</div>
          </div>
        )}
        {product.badge && (
          <div className="absolute left-0 top-6">
            <span className="rounded-l bg-orange-400 px-2 py-0.5 text-xs font-bold text-white">{product.badge}</span>
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <span className="rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">库存 {product.inventory}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="line-clamp-2 min-h-11 text-[15px] font-semibold leading-6 text-gray-900">{product.name}</p>
        <p className="mt-1 text-xs text-gray-400">{product.brand} / {product.colorway}</p>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tracking-tight text-[#ff5a1f]">¥{product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">¥{product.originalPrice}</span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 min-h-9 text-xs leading-5 text-gray-400">尺码：{product.sizes.join(" / ")}</p>

        <div className="mt-auto pt-3">
          <button
            className="w-full rounded-full bg-gradient-to-r from-[#ff7a1a] to-[#ff5a1f] py-2.5 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(255,90,31,0.22)] transition hover:opacity-95 active:scale-[0.98]"
            disabled={adding}
            onClick={handleAdd}
            type="button"
          >
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
    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-4 md:py-8">
      {contextHolder}

      <div className={isMobile ? "mb-4 rounded-[24px] border border-white/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]" : "mb-6 rounded-[28px] border border-white/80 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"}>
        <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">商品筛选</span>
            {hasActiveFilters && (
              <span className="rounded-full bg-[#fff1eb] px-2.5 py-1 text-xs font-medium text-[#ff5a1f]">已筛选</span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              className="flex items-center gap-1 text-sm text-gray-400 transition hover:text-[#ff5a1f]"
              onClick={() => setSelectedFilters({})}
              type="button"
            >
              <span>↺</span> 清除全部
            </button>
          )}
        </div>

        <div className={isMobile ? "flex flex-col gap-4" : "flex flex-col gap-4"}>
          {filterGroups.map((group) => (
            <div key={group.id} className={isMobile ? "flex flex-col gap-2" : "flex items-start gap-4"}>
              <span className={isMobile ? "text-sm font-semibold text-gray-700" : "mt-2 w-20 shrink-0 text-sm font-semibold text-gray-700"}>
                {group.name}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                    !selectedFilters[group.id]
                      ? "bg-gradient-to-r from-[#ff7a1a] to-[#ff5a1f] font-medium text-white shadow-[0_8px_18px_rgba(255,90,31,0.18)]"
                      : "bg-[#f5f7fb] text-gray-600 hover:bg-[#eef2f7]"
                  }`}
                  onClick={() => selectFilter(group)}
                  type="button"
                >
                  全部
                </button>
                {group.options.filter((o) => o.isActive !== false).map((option) => (
                  <button
                    key={option.id}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm transition ${
                      selectedFilters[group.id] === option.id
                        ? "bg-gradient-to-r from-[#ff7a1a] to-[#ff5a1f] font-medium text-white shadow-[0_8px_18px_rgba(255,90,31,0.18)]"
                        : "bg-[#f5f7fb] text-gray-600 hover:bg-[#eef2f7]"
                    }`}
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
      </div>

      <div className="mb-4 flex items-center justify-between px-1">
        <p className="text-sm text-gray-500">
          共 <span className="font-bold text-gray-900">{products.length}</span> 件商品
          {hasActiveFilters ? <span className="ml-1 text-[#ff5a1f]">· 已筛选</span> : null}
        </p>
        <div className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs text-gray-400 shadow-[0_6px_16px_rgba(15,23,42,0.04)]">
          <span>默认排序</span>
          <span className="font-medium text-[#ff5a1f]">推荐</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-gray-400">
          <span className="text-5xl">暂无</span>
          <p className="mt-4 text-base font-medium">暂无符合条件的商品</p>
          <p className="mt-1 text-sm">试试调整筛选条件</p>
          <button
            className="mt-4 tm-btn-primary px-8 py-2 text-sm"
            onClick={() => setSelectedFilters({})}
            type="button"
          >
            清除筛选
          </button>
        </div>
      ) : (
        <div className={isMobile ? "grid grid-cols-2 gap-3" : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"}>
          {products.map((product) => (
            <ProductCard key={product.id} isMobile={isMobile} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
