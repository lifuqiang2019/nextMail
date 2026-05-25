import { CheckoutShell } from "@/components/shop/checkout-shell";
import { isDatabaseConfigured } from "@/lib/database";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const store = await readStoreData();
  return <CheckoutShell databaseConfigured={isDatabaseConfigured()} settings={store.settings} />;
}

