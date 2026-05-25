import { ChangePasswordCard } from "@/components/auth/change-password-card";
import { isDatabaseConfigured, readOrdersByUserId } from "@/lib/database";
import { requireCustomerProfile } from "@/lib/auth/customer";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await requireCustomerProfile();
  const orders = isDatabaseConfigured() ? await readOrdersByUserId(user.id).catch(() => []) : [];

  return <ChangePasswordCard orders={orders} user={user} />;
}
