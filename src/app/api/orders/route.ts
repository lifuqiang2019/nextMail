import { z } from "zod";

import { getCurrentCustomerProfile } from "@/lib/auth/customer";
import { createOrderRecord, isDatabaseConfigured } from "@/lib/database";

export const dynamic = "force-dynamic";

const createOrderSchema = z.object({
  receiverName: z.string().trim().min(2, "Please enter the receiver name."),
  receiverPhone: z.string().trim().min(6, "Please enter a contact phone number."),
  receiverEmail: z.string().email("Please enter a valid contact email."),
  receiverAddress: z.string().trim().min(6, "Please enter the shipping address."),
  note: z.string().trim().max(200, "Notes must be 200 characters or fewer.").optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Your cart must contain at least one item."),
});

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json(
      { message: "Database connection is not configured yet (NEXTMAIL_DATABASE_URL / DATABASE_URL), so orders cannot be created right now." },
      { status: 503 },
    );
  }

  const currentUser = await getCurrentCustomerProfile();

  if (!currentUser) {
    return Response.json({ message: "Please sign in before placing an order." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = createOrderSchema.parse(body);
    const createdOrder = await createOrderRecord(currentUser.id, payload);

    return Response.json({
      orderId: createdOrder.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ message: error.issues[0]?.message || "Invalid request parameters." }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      return Response.json({ message: "The request body is not valid JSON." }, { status: 400 });
    }

    if (error instanceof Error) {
      if (
        /max_connections_per_hour|too many connections|can't reach database|econnrefused|etimedout|timeout|connect/i.test(
          error.message,
        )
      ) {
        return Response.json({ message: "The database is busy. Please try again later." }, { status: 503 });
      }

      return Response.json({ message: error.message }, { status: 400 });
    }

    return Response.json({ message: "Failed to create the order. Please try again later." }, { status: 500 });
  }
}
