import { redirect } from "next/navigation";

import { AdminLoginCard } from "@/components/auth/admin-login-card";
import { getCurrentAdminProfile } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const user = await getCurrentAdminProfile();
  if (user) {
    redirect("/admin");
  }

  return <AdminLoginCard />;
}

