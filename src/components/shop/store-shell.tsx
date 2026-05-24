"use client";

import { useMemo, useState } from "react";

import { useCart } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";
import type { StoreData } from "@/types/store";

export function StoreShell({ initialData }: { initialData: StoreData }) {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const { addItem, itemCount, openCart } = useCart();

  const products = useMemo(() => {
    if (activeCategoryId === "all") {
      return initialData.products;
    }

    return initialData.products.filter(
      (product) => product.categoryId === activeCategoryId,
    );
  }, [activeCategoryId, initialData.products]);

  const activeCategory = initialData.categories.find(
    (item) => item.id === activeCategoryId,
  );

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="rounded-[32px] bg-slate-950 px-6 py-8 text-white shadow-xl lg:px-10 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">
            {initialData.settings.storeName}
          </p>
          <div>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
              {initialData.settings.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              {initialData.settings.heroSubtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100"
                onClick={() => setActiveCategoryId("all")}
                type="button"
              >
                浏览全部商品
              </button>
              <button
                className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/10"
                onClick={openCart}
                type="button"
              >
                查看购物车 ({itemCount})
              </button>
            </div>
          </div>

          <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5">
            <div className="rounded-3xl bg-white/8 p-4">
              <p className="text-sm text-slate-300">商品数量</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {initialData.products.length}
              </p>
            </div>
            <div className="rounded-3xl bg-white/8 p-4">
              <p className="text-sm text-slate-300">分类数量</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {initialData.categories.length}
              </p>
            </div>
            <div className="rounded-3xl bg-white/8 p-4">
              <p className="text-sm text-slate-300">后台能力</p>
              <p className="mt-2 text-lg font-medium text-white">
                支持店铺配置、分类维护和商品管理
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-slate-300">商品分类</p>
              <h2 className="text-xl font-semibold text-white">分类筛选导航</h2>
            </div>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-slate-200">
              共 {initialData.categories.length} 个分类
            </span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCategoryId === "all"
                  ? "!border-slate-950 !bg-slate-950 !text-white shadow-sm"
                  : "border border-white/20 text-white hover:border-white/40 hover:bg-white/10"
              }`}
              onClick={() => setActiveCategoryId("all")}
              aria-pressed={activeCategoryId === "all"}
              type="button"
            >
              全部商品
            </button>
            {initialData.categories.map((category) => (
              <button
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  activeCategoryId === category.id
                    ? "!border-slate-950 !bg-slate-950 !text-white shadow-sm"
                    : "border border-white/20 text-white hover:border-white/40 hover:bg-white/10"
                }`}
                key={category.id}
                onClick={() => setActiveCategoryId(category.id)}
                aria-pressed={activeCategoryId === category.id}
                type="button"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">商品列表</p>
              <h2 className="text-2xl font-semibold text-slate-950">
                {activeCategory ? activeCategory.name : "全部商品"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {activeCategory
                  ? activeCategory.description
                  : "支持分类筛选、购物车加入与后台配置联动。"}
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
              共 {products.length} 件商品
            </span>
          </div>

          {products.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <p className="text-lg font-medium text-slate-900">当前分类还没有商品</p>
              <p className="mt-2 text-sm text-slate-500">
                你可以去后台继续配置商品，或切换到其他分类查看。
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <article
                  className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  key={product.id}
                >
                  <div className="flex h-48 items-end justify-between rounded-[24px] bg-linear-to-br from-slate-100 via-slate-50 to-white p-5">
                    <div>
                      <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                        {product.badge || "推荐"}
                      </span>
                      <p className="mt-3 text-sm text-slate-500">
                        {product.inventory > 0 ? `库存 ${product.inventory} 件` : "暂时缺货"}
                      </p>
                    </div>
                    <div className="rounded-full bg-slate-950 px-4 py-2 text-xs font-medium text-white">
                      {formatCurrency(product.price)}
                    </div>
                  </div>

                  <div className="mt-5">
                    <h3 className="text-lg font-semibold text-slate-950">{product.name}</h3>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-2xl font-semibold text-slate-950">
                        {formatCurrency(product.price)}
                      </p>
                      {product.originalPrice ? (
                        <p className="text-sm text-slate-400 line-through">
                          {formatCurrency(product.originalPrice)}
                        </p>
                      ) : null}
                    </div>
                    <button
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                      disabled={product.inventory <= 0}
                      onClick={() => addItem(product)}
                      type="button"
                    >
                      {product.inventory > 0 ? "加入购物车" : "已售罄"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}
