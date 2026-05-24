"use client";

import { message } from "antd";
import Image from "next/image";
import { useMemo, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import type { FilterGroup, Product, StoreData } from "@/types/store";

function calcDiscount(original: number, current: number) {
  if (!original || original <= current) return null;
  return Math.round((1 - current / original) * 10);
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = () => {
    setAdding(true);
    addItem(product);
    message.success({ content: `"${product.name}" 宸插姞鍏ヨ喘鐗╄溅`, duration: 1.5 });
    setTimeout(() => setAdding(false), 800);
  };

  const discount = product.originalPrice ? calcDiscount(product.originalPrice, product.price) : null;

  return (
    <div className="tm-card flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] bg-gray-100">
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
            <span>鏆傛棤鍥剧墖</span>
          </div>
        )}
        {discount && (
          <div className="absolute left-0 top-0">
            <div className="tm-badge">{discount}鎶?/div>
          </div>
        )}
        {product.badge && (
          <div className="absolute left-0 top-6">
            <span className="rounded-l bg-orange-400 px-2 py-0.5 text-xs font-bold text-white">{product.badge}</span>
          </div>
        )}
        <div className="absolute bottom-2 right-2">
          <span className="rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">搴撳瓨 {product.inventory}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug text-gray-800">{product.name}</p>
        <p className="mt-1 text-xs text-gray-400">{product.brand} 路 {product.colorway}</p>

        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-red-500">楼{product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">楼{product.originalPrice}</span>
          )}
        </div>

        <p className="mt-1 text-xs text-gray-400">灏虹爜锛歿product.sizes.join(" / ")}</p>

        <div className="mt-auto pt-2">
          <button
            className="tm-btn-primary w-full py-2 text-sm"
            disabled={adding}
            onClick={handleAdd}
            type="button"
          >
            {adding ? "宸叉坊鍔?鉁? : "鍔犲叆璐墿杞?}
          </button>
        </div>
      </div>
    </div>
  );
}

export function StoreShell({ initialData }: { initialData: StoreData }) {
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
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      {contextHolder}

      <div className="mb-4 flex items-center gap-2 overflow-x-auto text-sm text-gray-500">
        <span className="shrink-0 text-gray-400">绛涢€夛細</span>
        {filterGroups.map((group) => (
          <div key={group.id} className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-gray-400">{group.name}锛?/span>
            <div className="flex gap-1">
              <button
                className={`shrink-0 rounded-full border px-3 py-1 text-xs transition ${
                  !selectedFilters[group.id]
                    ? "border-orange-500 bg-orange-50 text-orange-500 font-medium"
                    : "border-gray-200 bg-white text-gray-500 hover:border-orange-300"
                }`}
                onClick={() => selectFilter(group)}
                type="button"
              >
                鍏ㄩ儴
              </button>
              {group.options.filter((o) => o.isActive !== false).map((option) => (
                <button
                  key={option.id}
                  className={`shrink-0 rounded-full border px-3 py-1 text-xs transition ${
                    selectedFilters[group.id] === option.id
                      ? "border-orange-500 bg-orange-50 text-orange-500 font-medium"
                      : "border-gray-200 bg-white text-gray-500 hover:border-orange-300"
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
        {hasActiveFilters && (
          <button
            className="shrink-0 text-xs text-gray-400 underline transition hover:text-red-500"
            onClick={() => setSelectedFilters({})}
            type="button"
          >
            娓呴櫎绛涢€?          </button>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          鍏?<span className="font-bold text-gray-800">{products.length}</span> 浠跺晢鍝?          {hasActiveFilters && <span className="ml-1 text-orange-500">锛堝凡绛涢€夛級</span>}
        </p>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <span>鍟嗗搧榛樿鎸?/span>
          <span className="font-medium text-orange-500">鎺ㄨ崘</span>
          <span>鎺掑簭</span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-20 text-gray-400">
          <span className="text-5xl">馃摝</span>
          <p className="mt-4 text-base font-medium">鏆傛棤绗﹀悎鏉′欢鐨勫晢鍝?/p>
          <p className="mt-1 text-sm">璇曡瘯璋冩暣绛涢€夋潯浠?/p>
          <button
            className="mt-4 tm-btn-primary px-8 py-2 text-sm"
            onClick={() => setSelectedFilters({})}
            type="button"
          >
            娓呴櫎绛涢€?          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
