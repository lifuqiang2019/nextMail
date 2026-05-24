import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { getDataAccessMode } from "@/lib/database";
import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const store = await readStoreData();
  const dataAccessMode = getDataAccessMode();

  return <AdminDashboard dataAccessMode={dataAccessMode} initialData={store} />;
}
