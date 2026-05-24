import { NextResponse } from "next/server";

import { getCurrentCustomerProfile } from "@/lib/auth/customer";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentCustomerProfile();
  if (!user) {
    return NextResponse.json({ message: "请先登录" }, { status: 401 });
  }

  const { currentPassword, newPassword } = (await request.json()) as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ message: "请填写完整信息，新密码至少 6 位" }, { status: 400 });
  }

  const dbUser = await prisma.customerUser.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return NextResponse.json({ message: "用户不存在" }, { status: 404 });
  }

  const valid = await verifyPassword(currentPassword, dbUser.passwordHash);
  if (!valid) {
    return NextResponse.json({ message: "当前密码不正确" }, { status: 400 });
  }

  await prisma.customerUser.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(newPassword),
    },
  });

  return NextResponse.json({ ok: true });
}
