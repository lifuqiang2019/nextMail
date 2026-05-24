import Link from "next/link";
import { StoreShell } from "@/components/shop/store-shell";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const store = await readStoreData();

  return (
    <div>
      {/* 金刚区（分类入口） */}
      <div className="bg-[#f0f2f5] pt-2 pb-0 md:pt-4">
        <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
          <div id="categories" className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-8 md:gap-4 bg-white rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm">
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
