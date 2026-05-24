import { z } from "zod";

import { hashPassword, saveSession } from "@/lib/auth";
import {
  createUserRecord,
  findUserIdByEmail,
  isDatabaseConfigured,
  normalizeEmail,
} from "@/lib/database";

export const dynamic = "force-dynamic";

const registerSchema = z.object({
  email: z.string().email("请输入正确的邮箱地址。"),
  password: z.string().min(6, "密码至少 6 位。"),
  name: z.string().trim().min(2, "昵称至少 2 个字符。").max(30, "昵称不能超过 30 个字符。").optional(),
});

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json(
      { message: "当前未配置 DATABASE_URL，暂时无法使用注册功能。" },
      { status: 503 },
    );
  }

  try {
    const body = await request.json();
    const payload = registerSchema.parse(body);
    const email = normalizeEmail(payload.email);

    const existingUser = await findUserIdByEmail(email);

    if (existingUser) {
      return Response.json({ message: "该邮箱已注册。" }, { status: 409 });
    }

    const user = await createUserRecord({
      email,
      name: payload.name?.trim() || email.split("@")[0],
      passwordHash: await hashPassword(payload.password),
    });

    await saveSession(user);

    return Response.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: error.issues[0]?.message || "参数错误。" }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      return Response.json({ message: "请求体不是合法的 JSON。" }, { status: 400 });
    }

    return Response.json({ message: "注册失败，请稍后重试。" }, { status: 500 });
  }
}
