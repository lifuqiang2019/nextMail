import { CheckoutShell } from "@/components/shop/checkout-shell";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const store = await readStoreData();
  return <CheckoutShell settings={store.settings} />;
}
