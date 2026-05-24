import { NextResponse } from "next/server";

import { createCustomerSession } from "@/lib/auth/customer";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { name, email, password } = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
  };

  if (!name || !email || !password || password.length < 6) {
    return NextResponse.json({ message: "请填写完整注册信息，密码至少 6 位" }, { status: 400 });
  }

  const exists = await prisma.customerUser.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ message: "该邮箱已注册" }, { status: 409 });
  }

  const user = await prisma.customerUser.create({
    data: {
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: await hashPassword(password),
    },
  });

  await createCustomerSession(user.id);

  return NextResponse.json({ ok: true });
}
