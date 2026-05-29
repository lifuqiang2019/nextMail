import { NextResponse } from "next/server";

import { ensureAdminApiAccess } from "@/lib/admin/guards";
import { hashPassword } from "@/lib/auth/password";
import { normalizeEmail } from "@/lib/database";
import { prisma } from "@/lib/prisma";

type CustomerUserPayload = {
  id?: string;
  name?: string;
  email?: string;
  password?: string;
  isActive?: boolean;
};

export async function PATCH(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const body = (await request.json()) as CustomerUserPayload;
  const trimmedName = body.name?.trim();
  const trimmedPassword = body.password?.trim();

  if (!body.id || !trimmedName || !body.email) {
    return NextResponse.json({ message: "Please provide user id, name, and email." }, { status: 400 });
  }

  if (trimmedPassword && trimmedPassword.length < 6) {
    return NextResponse.json({ message: "Password must be at least 6 characters." }, { status: 400 });
  }

  const normalizedEmail = normalizeEmail(body.email);
  const existingUser = await prisma.customerUser.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });

  if (existingUser && existingUser.id !== body.id) {
    return NextResponse.json({ message: "This email has already been registered." }, { status: 409 });
  }

  const updateData: {
    name: string;
    email: string;
    isActive: boolean;
    passwordHash?: string;
  } = {
    name: trimmedName,
    email: normalizedEmail,
    isActive: Boolean(body.isActive ?? true),
  };

  if (trimmedPassword) {
    updateData.passwordHash = await hashPassword(trimmedPassword);
  }

  const user = await prisma.customerUser.update({
    where: { id: body.id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(user);
}
