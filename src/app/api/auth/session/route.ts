import { getCurrentCustomerProfile } from "@/lib/auth/customer";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentCustomerProfile();

  return Response.json({ user });
}
