"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Category, Product, StoreData } from "@/types/store";

type SaveStatus = "idle" | "saving" | "success" | "error";

function createCategory(index: number): Category {
  const id = `cat-${crypto.randomUUID().slice(0, 8)}`;

  return {
    id,
    name: `新分类 ${index + 1}`,
    description: "请填写分类描述",
  };
}

function createProduct(categoryId: string, index: number): Product {
  return {
    id: `prod-${crypto.randomUUID().slice(0, 8)}`,
    name: `新商品 ${index + 1}`,
    categoryId,
    price: 199,
    originalPrice: 299,
    badge: "新品",
    inventory: 20,
    description: "请填写商品描述",
  };
}

export function AdminDashboard({ initialData }: { initialData: StoreData }) {
  const [formData, setFormData] = useState<StoreData>(initialData);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState("");

  const categoryOptions = useMemo(() => formData.categories, [formData.categories]);

  const updateSettings = (field: keyof StoreData["settings"], value: string) => {
    setFormData((current) => ({
      ...current,
      settings: {
        ...current.settings,
        [field]: value,
      },
    }));
  };

  const updateCategory = (
    categoryId: string,
    field: keyof Category,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      categories: current.categories.map((category) =>
        category.id === categoryId ? { ...category, [field]: value } : category,
      ),
    }));
  };

  const removeCategory = (categoryId: string) => {
    setFormData((current) => {
      if (current.categories.length === 1) {
        return current;
      }

      const nextCategories = current.categories.filter(
        (category) => category.id !== categoryId,
      );
      const fallbackCategoryId = nextCategories[0].id;

      return {
        ...current,
        categories: nextCategories,
        products: current.products.map((product) =>
          product.categoryId === categoryId
            ? { ...product, categoryId: fallbackCategoryId }
            : product,
        ),
      };
    });
  };

  const addCategory = () => {
    setFormData((current) => ({
      ...current,
      categories: [...current.categories, createCategory(current.categories.length)],
    }));
  };

  const updateProduct = (
    productId: string,
    field: keyof Product,
    value: string | number,
  ) => {
    setFormData((current) => ({
      ...current,
      products: current.products.map((product) =>
        product.id === productId ? { ...product, [field]: value } : product,
      ),
    }));
  };

  const removeProduct = (productId: string) => {
    setFormData((current) => ({
      ...current,
      products: current.products.filter((product) => product.id !== productId),
    }));
  };

  const addProduct = () => {
    const defaultCategoryId = formData.categories[0]?.id ?? "cat-default";

    setFormData((current) => ({
      ...current,
      products: [
        ...current.products,
        createProduct(defaultCategoryId, current.products.length),
      ],
    }));
  };

  const saveData = async () => {
    setSaveStatus("saving");
    setMessage("正在保存配置...");

    try {
      const response = await fetch("/api/admin/store", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("保存失败");
      }

      const nextData = (await response.json()) as StoreData;
      setFormData(nextData);
      setSaveStatus("success");
      setMessage("保存成功，前台首页会立即读取最新配置。");
    } catch {
      setSaveStatus("error");
      setMessage("保存失败，请稍后重试。");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <section className="flex flex-col gap-4 rounded-[32px] bg-slate-950 px-6 py-8 text-white lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-slate-300">Admin Console</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">商城后台配置</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
            在同一个 Next 项目中维护店铺信息、分类和商品数据。当前数据持久化在项目根目录下的 data/store.json。
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/10"
            href="/"
          >
            返回前台
          </Link>
          <button
            className="rounded-full bg-white px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={saveStatus === "saving"}
            onClick={saveData}
            type="button"
          >
            {saveStatus === "saving" ? "保存中..." : "保存配置"}
          </button>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr_1.9fr]">
        <div className="space-y-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-sm text-slate-500">店铺信息</p>
            <h2 className="text-2xl font-semibold text-slate-950">基础配置</h2>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">店铺名称</span>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
              onChange={(event) => updateSettings("storeName", event.target.value)}
              value={formData.settings.storeName}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">首页主标题</span>
            <input
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
              onChange={(event) => updateSettings("heroTitle", event.target.value)}
              value={formData.settings.heroTitle}
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">首页副标题</span>
            <textarea
              className="min-h-32 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
              onChange={(event) => updateSettings("heroSubtitle", event.target.value)}
              value={formData.settings.heroSubtitle}
            />
          </label>
          <div
            className={`rounded-2xl px-4 py-3 text-sm ${
              saveStatus === "error"
                ? "bg-rose-50 text-rose-600"
                : saveStatus === "success"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {message || "修改后点击右上角按钮保存。"}
          </div>
        </div>

        <div className="space-y-8">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">分类管理</p>
                <h2 className="text-2xl font-semibold text-slate-950">首页左侧分类</h2>
              </div>
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                onClick={addCategory}
                type="button"
              >
                新增分类
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {formData.categories.map((category) => (
                <div className="rounded-3xl border border-slate-200 p-4" key={category.id}>
                  <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">分类名称</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                        onChange={(event) =>
                          updateCategory(category.id, "name", event.target.value)
                        }
                        value={category.name}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">分类描述</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                        onChange={(event) =>
                          updateCategory(category.id, "description", event.target.value)
                        }
                        value={category.description}
                      />
                    </label>
                    <div className="flex items-end">
                      <button
                        className="w-full rounded-2xl border border-rose-200 px-4 py-3 text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={formData.categories.length === 1}
                        onClick={() => removeCategory(category.id)}
                        type="button"
                      >
                        删除分类
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">商品管理</p>
                <h2 className="text-2xl font-semibold text-slate-950">首页商品展示</h2>
              </div>
              <button
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
                onClick={addProduct}
                type="button"
              >
                新增商品
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {formData.products.map((product) => (
                <div className="rounded-3xl border border-slate-200 p-5" key={product.id}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">商品名称</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                        onChange={(event) =>
                          updateProduct(product.id, "name", event.target.value)
                        }
                        value={product.name}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">商品标签</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                        onChange={(event) =>
                          updateProduct(product.id, "badge", event.target.value)
                        }
                        value={product.badge || ""}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">所属分类</span>
                      <select
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                        onChange={(event) =>
                          updateProduct(product.id, "categoryId", event.target.value)
                        }
                        value={product.categoryId}
                      >
                        {categoryOptions.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">库存</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                        min={0}
                        onChange={(event) =>
                          updateProduct(product.id, "inventory", Number(event.target.value))
                        }
                        type="number"
                        value={product.inventory}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">当前价格</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                        min={0}
                        onChange={(event) =>
                          updateProduct(product.id, "price", Number(event.target.value))
                        }
                        type="number"
                        value={product.price}
                      />
                    </label>
                    <label className="space-y-2">
                      <span className="text-sm font-medium text-slate-700">划线价</span>
                      <input
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                        min={0}
                        onChange={(event) =>
                          updateProduct(
                            product.id,
                            "originalPrice",
                            Number(event.target.value),
                          )
                        }
                        type="number"
                        value={product.originalPrice || 0}
                      />
                    </label>
                  </div>

                  <label className="mt-4 block space-y-2">
                    <span className="text-sm font-medium text-slate-700">商品描述</span>
                    <textarea
                      className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-400"
                      onChange={(event) =>
                        updateProduct(product.id, "description", event.target.value)
                      }
                      value={product.description}
                    />
                  </label>

                  <div className="mt-4 flex justify-end">
                    <button
                      className="rounded-full border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                      onClick={() => removeProduct(product.id)}
                      type="button"
                    >
                      删除商品
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
