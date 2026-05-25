import { NextResponse } from "next/server";

import { createCustomerSession, isRecoverableCustomerAuthError } from "@/lib/auth/customer";
import { hashPassword } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { name, email, password } = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ message: "请填写完整注册信息，密码至少 6 位" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    const exists = await prisma.customerUser.findUnique({ where: { email: normalizedEmail } });
    if (exists) {
      return NextResponse.json({ message: "该邮箱已注册" }, { status: 409 });
    }

    const user = await prisma.customerUser.create({
      data: {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
      },
    });

    await createCustomerSession(user.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "请求体不是合法的 JSON" }, { status: 400 });
    }

    if (isRecoverableCustomerAuthError(error)) {
      return NextResponse.json(
        { message: "当前数据库连接异常，暂时无法注册，请稍后再试。" },
        { status: 503 },
      );
    }

    return NextResponse.json({ message: "注册失败，请稍后重试。" }, { status: 500 });
  }
}
