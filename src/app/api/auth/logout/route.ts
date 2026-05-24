import { NextResponse } from "next/server";

import { destroyCustomerSession } from "@/lib/auth/customer";

export async function POST() {
  await destroyCustomerSession();
  return NextResponse.json({ ok: true });
}
