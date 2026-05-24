import { NextResponse } from "next/server";

import { createCustomerSession } from "@/lib/auth/customer";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ message: "请输入邮箱和密码" }, { status: 400 });
  }

  const user = await prisma.customerUser.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return NextResponse.json({ message: "账号不存在或已停用" }, { status: 404 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ message: "密码错误" }, { status: 401 });
  }

  await createCustomerSession(user.id);
  return NextResponse.json({ ok: true });
}
