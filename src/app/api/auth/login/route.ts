import { NextResponse } from "next/server";

import { createCustomerSession, isRecoverableCustomerAuthError } from "@/lib/auth/customer";
import { verifyPassword } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ message: "请输入邮箱和密码" }, { status: 400 });
    }

    const user = await prisma.customerUser.findUnique({
      where: { email: normalizeEmail(email) },
    });
    if (!user || !user.isActive) {
      return NextResponse.json({ message: "账号不存在或已停用" }, { status: 404 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ message: "密码错误" }, { status: 401 });
    }

    await createCustomerSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "请求体不是合法的 JSON" }, { status: 400 });
    }

    if (isRecoverableCustomerAuthError(error)) {
      return NextResponse.json(
        { message: "当前数据库连接异常，暂时无法登录，请稍后再试。" },
        { status: 503 },
      );
    }

    return NextResponse.json({ message: "登录失败，请稍后重试。" }, { status: 500 });
  }
}
