import { StoreShell } from "@/components/shop/store-shell";
import { detectIsMobile } from "@/lib/device";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [store, isMobile] = await Promise.all([readStoreData(), detectIsMobile()]);

  return (
    <div className={isMobile ? "pb-2 pt-2" : "pb-4 pt-5 lg:pt-6"}>
      <StoreShell initialData={store} isMobile={isMobile} />
    </div>
  );
}
