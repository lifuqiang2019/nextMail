import { redirect } from "next/navigation";

import { CustomerAuthCard } from "@/components/auth/customer-auth-card";
import { getCurrentCustomerProfile } from "@/lib/auth/customer";

export const dynamic = "force-dynamic";

export default async function AuthPage() {
  const user = await getCurrentCustomerProfile();
  if (user) {
    redirect("/account");
  }

  return (
    <div className="tm-shell py-5 sm:py-10 lg:py-14">
      <CustomerAuthCard />
    </div>
  );
}
