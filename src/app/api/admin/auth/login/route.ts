import { NextResponse } from "next/server";

import { createAdminSession, isRecoverableAdminAuthError } from "@/lib/auth/admin";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { username, password } = (await request.json()) as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json({ message: "Please enter your username and password." }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({ where: { username } });
    if (!user || !user.isActive) {
      return NextResponse.json({ message: "The admin account does not exist or has been disabled." }, { status: 404 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ message: "Incorrect password." }, { status: 401 });
    }

    await createAdminSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "The request body is not valid JSON." }, { status: 400 });
    }

    if (isRecoverableAdminAuthError(error)) {
      return NextResponse.json(
        { message: "The database is temporarily unavailable, so admin sign-in cannot be completed right now. Please try again later." },
        { status: 503 },
      );
    }

    return NextResponse.json({ message: "Admin sign-in failed. Please try again later." }, { status: 500 });
  }
}
