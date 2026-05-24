import { z } from "zod";

import { saveSession, verifyPassword } from "@/lib/auth";
import {
  findUserForLogin,
  isDatabaseConfigured,
  normalizeEmail,
} from "@/lib/database";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email("请输入正确的邮箱地址。"),
  password: z.string().min(1, "请输入密码。"),
});

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json(
      { message: "当前未配置 DATABASE_URL，暂时无法使用登录功能。" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);
    const user = await findUserForLogin(normalizeEmail(payload.email));

    if (!user) {
      return Response.json({ message: "邮箱或密码错误。" }, { status: 401 });
    }

    const passwordMatched = await verifyPassword(payload.password, user.passwordHash);

    if (!passwordMatched) {
      return Response.json({ message: "邮箱或密码错误。" }, { status: 401 });
    }

    await saveSession({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: error.issues[0]?.message || "参数错误。" }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      return Response.json({ message: "请求体不是合法的 JSON。" }, { status: 400 });
    }

    return Response.json({ message: "登录失败，请稍后重试。" }, { status: 500 });
  }
}
