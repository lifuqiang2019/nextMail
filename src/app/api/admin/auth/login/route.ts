import { NextResponse } from "next/server";

import { createAdminSession } from "@/lib/auth/admin";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { username, password } = (await request.json()) as {
    username?: string;
    password?: string;
  };

  if (!username || !password) {
    return NextResponse.json({ message: "请输入账号和密码" }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user || !user.isActive) {
    return NextResponse.json({ message: "管理员账号不存在或已停用" }, { status: 404 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ message: "密码错误" }, { status: 401 });
  }

  await createAdminSession(user.id);
  return NextResponse.json({ ok: true });
}
