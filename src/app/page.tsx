import { StoreShell } from "@/components/shop/store-shell";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = await readStoreData();

  return <StoreShell initialData={store} />;
}
