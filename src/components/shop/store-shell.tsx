"use client";

import { useMemo, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import type { FilterGroup, StoreData } from "@/types/store";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function StoreShell({ initialData }: { initialData: StoreData }) {
  const { addItem, itemCount, openCart } = useCart();
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});

  const products = useMemo(() => {
    return initialData.products.filter((product) => {
      return initialData.filterGroups.every((group) => {
        const selectedOptionId = selectedFilters[group.id];
        if (!selectedOptionId) {
          return true;
        }
        return product.filterOptionIds.includes(selectedOptionId);
      });
    });
  }, [initialData.filterGroups, initialData.products, selectedFilters]);

  const filterGroups = initialData.filterGroups.filter((group) => group.isActive !== false);

  const selectFilter = (group: FilterGroup, optionId?: string) => {
    setSelectedFilters((current) => {
      if (!optionId) {
        const next = { ...current };
        delete next[group.id];
        return next;
      }
      return {
        ...current,
        [group.id]: optionId,
      };
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:py-10">
      <section className="overflow-hidden rounded-[28px] bg-slate-950 px-5 py-6 text-white shadow-xl sm:px-8 sm:py-8">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Mobile First Storefront</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{initialData.settings.heroTitle}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">{initialData.settings.heroSubtitle}</p>
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">{initialData.settings.heroNotice}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950" onClick={openCart} type="button">
            购物车 ({itemCount})
          </button>
          <div className="rounded-full border border-white/15 px-4 py-3 text-sm text-slate-200">
            联系方式：{initialData.settings.supportPhone}
          </div>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">条件过滤</p>
            <h2 className="text-xl font-semibold text-slate-950">后台可配置筛选条件</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">移动端优先</span>
        </div>
        <div className="space-y-4">
          {filterGroups.map((group) => (
            <div key={group.id}>
              <p className="mb-2 text-sm font-medium text-slate-700">{group.name}</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
                    !selectedFilters[group.id]
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700"
                  }`}
                  onClick={() => selectFilter(group)}
                  type="button"
                >
                  全部
                </button>
                {group.options.filter((option) => option.isActive !== false).map((option) => (
                  <button
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm ${
                      selectedFilters[group.id] === option.id
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                    key={option.id}
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

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">商品列表</p>
            <h2 className="text-xl font-semibold text-slate-950">共 {products.length} 件商品</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => (
            <article className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm" key={product.id}>
              <div className="aspect-[4/3] bg-cover bg-center" style={{ backgroundImage: `url(${product.imageUrl})` }} />
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{product.badge || product.brand}</span>
                  <span className="text-xs text-slate-500">库存 {product.inventory}</span>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">{product.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{product.brand} · {product.colorway}</p>
                <p className="mt-3 text-sm leading-6 text-slate-500">{product.description}</p>
                <p className="mt-3 text-xs text-slate-500">尺码：{product.sizes.join(" / ")}</p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-2xl font-semibold text-slate-950">{formatCurrency(product.price)}</p>
                    {product.originalPrice ? <p className="text-sm text-slate-400 line-through">{formatCurrency(product.originalPrice)}</p> : null}
                  </div>
                  <button className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white" onClick={() => addItem(product)} type="button">
                    加入购物车
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
