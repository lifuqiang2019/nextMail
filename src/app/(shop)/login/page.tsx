import { redirect } from "next/navigation";

import { CustomerAuthCard } from "@/components/auth/customer-auth-card";
import { getCurrentCustomerProfile } from "@/lib/auth/customer";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentCustomerProfile();
  if (user) {
    redirect("/account");
  }

  return (
    <div className="tm-shell py-5 sm:py-10 lg:py-14">
      <CustomerAuthCard
        description="登录后可继续完成下单、查看订单记录，也可以直接注册后自动进入商城流程。"
        successRedirect="/cart"
        title="邮箱登录 / 注册"
      />
    </div>
  );
}

