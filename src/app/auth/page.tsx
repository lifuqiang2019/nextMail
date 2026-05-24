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
    <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <CustomerAuthCard />
    </div>
  );
}
