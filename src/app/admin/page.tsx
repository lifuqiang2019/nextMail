import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const store = await readStoreData();

  return <AdminDashboard initialData={store} />;
}
