import { ChangePasswordCard } from "@/components/auth/change-password-card";
import { requireCustomerProfile } from "@/lib/auth/customer";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireCustomerProfile();

  return <ChangePasswordCard user={user} />;
}
