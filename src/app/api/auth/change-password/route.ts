import { NextResponse } from "next/server";

import { getCurrentCustomerProfile } from "@/lib/auth/customer";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await getCurrentCustomerProfile();
  if (!user) {
    return NextResponse.json({ message: "Please sign in first." }, { status: 401 });
  }

  const { currentPassword, newPassword } = (await request.json()) as {
    currentPassword?: string;
    newPassword?: string;
  };

  if (!currentPassword || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ message: "Please complete all fields. The new password must be at least 6 characters." }, { status: 400 });
  }

  const dbUser = await prisma.customerUser.findUnique({ where: { id: user.id } });
  if (!dbUser) {
    return NextResponse.json({ message: "User not found." }, { status: 404 });
  }

  const valid = await verifyPassword(currentPassword, dbUser.passwordHash);
  if (!valid) {
    return NextResponse.json({ message: "The current password is incorrect." }, { status: 400 });
  }

  await prisma.customerUser.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(newPassword),
    },
  });

  return NextResponse.json({ ok: true });
}
