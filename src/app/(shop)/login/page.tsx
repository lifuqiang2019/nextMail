import { redirect } from "next/navigation";

import { CustomerAuthCard } from "@/components/auth/customer-auth-card";
import { getCurrentCustomerProfile } from "@/lib/auth/customer";
import { getServerTranslator } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const { t } = await getServerTranslator();
  const user = await getCurrentCustomerProfile();
  if (user) {
    redirect("/account");
  }

  return (
    <div className="tm-shell py-5 sm:py-10 lg:py-14">
      <CustomerAuthCard
        description={t("auth.desc")}
        successRedirect="/cart"
        title={t("auth.email") + " " + t("auth.loginTab") + " / " + t("auth.registerTab")}
      />
    </div>
  );
}
