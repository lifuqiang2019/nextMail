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
      return NextResponse.json({ message: "Please complete all registration fields. Password must be at least 6 characters." }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    const exists = await prisma.customerUser.findUnique({ where: { email: normalizedEmail } });
    if (exists) {
      return NextResponse.json({ message: "This email has already been registered." }, { status: 409 });
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
      return NextResponse.json({ message: "The request body is not valid JSON." }, { status: 400 });
    }

    if (isRecoverableCustomerAuthError(error)) {
      return NextResponse.json(
        { message: "The database is temporarily unavailable, so registration cannot be completed right now. Please try again later." },
        { status: 503 },
      );
    }

    return NextResponse.json({ message: "Registration failed. Please try again later." }, { status: 500 });
  }
}
