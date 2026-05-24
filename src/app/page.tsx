import Link from "next/link";
import { StoreShell } from "@/components/shop/store-shell";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await readStoreData();

  return (
    <div>
      <div
        className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-red-500 px-6 py-10 text-white sm:px-10 sm:py-16"
        style={{
          backgroundImage: "linear-gradient(135deg, #ff6b00 0%, #ff0036 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <div className="mb-3 inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium text-white">
                🔥 今日热卖
              </div>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                {store.settings.heroTitle}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-white/80">
                {store.settings.heroSubtitle}
              </p>
              {store.settings.heroNotice && (
                <div className="mt-4 inline-block rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/90">
                  📢 {store.settings.heroNotice}
                </div>
              )}
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="flex gap-4">
                  {store.products.slice(0, 2).map((product) => (
                    <div
                      key={product.id}
                      className="w-48 overflow-hidden rounded-2xl bg-white/10 backdrop-blur shadow-xl"
                    >
                      <div
                        className="h-36 w-full bg-cover bg-center"
                        style={{ backgroundImage: `url(${product.imageUrl})` }}
                      />
                      <div className="p-3">
                        <p className="truncate text-sm font-medium text-white">{product.name}</p>
                        <p className="mt-1 text-xl font-bold text-yellow-300">¥{product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute -bottom-3 -right-3 rounded-full bg-yellow-400 px-4 py-2 text-sm font-bold text-red-700 shadow-lg">
                  抢先购 →
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4 sm:grid-cols-5">
            {store.categories.map((category) => (
              <Link
                key={category.id}
                className="flex flex-col items-center gap-2 rounded-xl bg-white/10 p-3 text-center text-white transition hover:bg-white/20"
                href="/"
              >
                <span className="text-2xl">🏷️</span>
                <span className="text-xs font-medium">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <StoreShell initialData={store} />
    </div>
  );
}
