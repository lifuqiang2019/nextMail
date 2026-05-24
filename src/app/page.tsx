import Link from "next/link";
import { StoreShell } from "@/components/shop/store-shell";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await readStoreData();

  return (
    <div>
      {/* 顶部横幅 Banner */}
      <div className="bg-[#f0f2f5] pt-2 pb-0 md:pt-4">
        <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
          <div
            className="relative overflow-hidden rounded-xl md:rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 px-6 py-8 text-white sm:px-10 sm:py-12"
            style={{
              backgroundImage: "linear-gradient(135deg, #ff6b00 0%, #ff0036 100%)",
            }}
          >
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div>
                <div className="mb-2 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium text-white md:text-sm">
                  🔥 今日热卖
                </div>
                <h1 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                  {store.settings.heroTitle}
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-white/80 md:text-base">
                  {store.settings.heroSubtitle}
                </p>
                {store.settings.heroNotice && (
                  <div className="mt-3 inline-block rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs text-white/90">
                    📢 {store.settings.heroNotice}
                  </div>
                )}
              </div>
              <div className="hidden lg:flex justify-end">
                <div className="relative">
                  <div className="flex gap-4">
                    {store.products.slice(0, 2).map((product) => (
                      <div
                        key={product.id}
                        className="w-40 overflow-hidden rounded-xl bg-white/10 backdrop-blur shadow-xl"
                      >
                        <div
                          className="h-32 w-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${product.imageUrl})` }}
                        />
                        <div className="p-2">
                          <p className="truncate text-xs font-medium text-white">{product.name}</p>
                          <p className="mt-1 text-lg font-bold text-yellow-300">¥{product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 金刚区（分类入口） */}
          <div id="categories" className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-8 md:gap-4 bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm">
            {store.categories.map((category) => (
              <Link
                key={category.id}
                className="flex flex-col items-center gap-1.5 p-2 transition hover:opacity-80"
                href={`/#categories`} // 这里真实场景下可以跳转带参数或者让 store-shell 响应
              >
                <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-orange-50 text-xl md:text-2xl text-orange-500">
                  🏷️
                </div>
                <span className="text-xs text-gray-700">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <StoreShell initialData={store} />
    </div>
  );
}
