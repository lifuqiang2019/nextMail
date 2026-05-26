import { AdminConsole } from "@/components/admin/admin-console";
import { requireAdminProfile } from "@/lib/auth/admin";
import { readAdminDashboardData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const admin = await requireAdminProfile();
  const data = await readAdminDashboardData();

  return <AdminConsole admin={admin} initialData={JSON.parse(JSON.stringify(data))} />;
}
