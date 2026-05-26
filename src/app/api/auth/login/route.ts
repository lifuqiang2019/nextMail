import { NextResponse } from "next/server";

import { createCustomerSession, isRecoverableCustomerAuthError } from "@/lib/auth/customer";
import { verifyPassword } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/database";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password } = (await request.json()) as { email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ message: "Please enter your email and password." }, { status: 400 });
    }

    const user = await prisma.customerUser.findUnique({
      where: { email: normalizeEmail(email) },
    });
    if (!user || !user.isActive) {
      return NextResponse.json({ message: "The account does not exist or has been disabled." }, { status: 404 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ message: "Incorrect password." }, { status: 401 });
    }

    await createCustomerSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ message: "The request body is not valid JSON." }, { status: 400 });
    }

    if (isRecoverableCustomerAuthError(error)) {
      return NextResponse.json(
        { message: "The database is temporarily unavailable, so sign-in cannot be completed right now. Please try again later." },
        { status: 503 },
      );
    }

    return NextResponse.json({ message: "Sign-in failed. Please try again later." }, { status: 500 });
  }
}
