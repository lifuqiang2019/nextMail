import Link from "next/link";
import { StoreShell } from "@/components/shop/store-shell";
import { detectIsMobile } from "@/lib/device";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [store, isMobile] = await Promise.all([readStoreData(), detectIsMobile()]);

  return (
    <div>
      <div className={isMobile ? "pt-3" : "pt-5"}>
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
          <div
            className={
              isMobile
                ? "rounded-[24px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                : "rounded-[28px] bg-white p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            }
            id="categories"
          >
            {isMobile ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">分类选购</h2>
                    <p className="mt-1 text-xs text-gray-400">像逛 App 一样快速进入分类</p>
                  </div>
                  <span className="rounded-full bg-[#fff1eb] px-3 py-1 text-xs font-medium text-[#ff5a1f]">精选</span>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {store.categories.map((category) => (
                    <Link
                      key={category.id}
                      className="flex flex-col items-center gap-2 rounded-2xl bg-[#faf7f4] px-2 py-3 transition active:scale-[0.98]"
                      href="/#categories"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1eb] text-xl text-[#ff5a1f]">
                        🏷️
                      </div>
                      <span className="text-xs font-medium text-gray-700">{category.name}</span>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <div className="grid grid-cols-[1.2fr_1fr] gap-6">
                <div className="rounded-[24px] bg-gradient-to-br from-[#fff6f0] to-[#fff] p-7">
                  <p className="text-sm font-medium text-[#ff5a1f]">Shoes / Apparel / Trend</p>
                  <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900">{store.settings.heroTitle}</h1>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-gray-500">{store.settings.heroSubtitle}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {store.categories.map((category) => (
                      <Link
                        key={category.id}
                        className="rounded-full border border-[#ffd7c8] bg-white px-4 py-2 text-sm text-gray-700 transition hover:border-[#ff5a1f] hover:text-[#ff5a1f]"
                        href="/#categories"
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {store.products.slice(0, 4).map((product) => (
                    <div key={product.id} className="overflow-hidden rounded-[24px] bg-[#f8fafc]">
                      <div
                        className="h-40 bg-cover bg-center"
                        style={{ backgroundImage: `url(${product.imageUrl})` }}
                      />
                      <div className="p-4">
                        <p className="line-clamp-1 text-sm font-semibold text-gray-900">{product.name}</p>
                        <p className="mt-2 text-lg font-bold text-[#ff5a1f]">¥{product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <StoreShell initialData={store} isMobile={isMobile} />
    </div>
  );
}
