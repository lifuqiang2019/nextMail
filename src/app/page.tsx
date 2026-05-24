import Link from "next/link";
import { StoreShell } from "@/components/shop/store-shell";
import { detectIsMobile } from "@/lib/device";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [store, isMobile] = await Promise.all([readStoreData(), detectIsMobile()]);

  return (
    <div>
      {isMobile ? (
        <div className="pt-3">
          <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
            <div
              className="rounded-[24px] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
              id="categories"
            >
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
            </div>
          </div>
        </div>
      ) : null}

      <StoreShell initialData={store} isMobile={isMobile} />
    </div>
  );
}
