import { z } from "zod";

import { getCurrentCustomerProfile } from "@/lib/auth/customer";
import { createOrderRecord, isDatabaseConfigured } from "@/lib/database";

export const dynamic = "force-dynamic";

const createOrderSchema = z.object({
  receiverName: z.string().trim().min(2, "请填写收货人姓名。"),
  receiverPhone: z.string().trim().min(6, "请填写联系电话。"),
  receiverEmail: z.string().email("请填写正确的联系邮箱。"),
  receiverAddress: z.string().trim().min(6, "请填写收货地址。"),
  note: z.string().trim().max(200, "备注不能超过 200 字。").optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "购物车至少需要 1 件商品。"),
});

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) {
    return Response.json(
      { message: "当前未配置数据库连接串（NEXTMAIL_DATABASE_URL / DATABASE_URL），暂时无法创建订单。" },
      { status: 503 },
    );
  }

  const currentUser = await getCurrentCustomerProfile();

  if (!currentUser) {
    return Response.json({ message: "请先登录后再下单。" }, { status: 401 });
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
      return Response.json({ message: error.issues[0]?.message || "参数错误。" }, { status: 400 });
    }

    if (error instanceof SyntaxError) {
      return Response.json({ message: "请求体不是合法的 JSON。" }, { status: 400 });
    }

    if (error instanceof Error) {
      if (
        /max_connections_per_hour|too many connections|can't reach database|econnrefused|etimedout|timeout|connect/i.test(
          error.message,
        )
      ) {
        return Response.json({ message: "数据库连接繁忙，请稍后重试。" }, { status: 503 });
      }

      return Response.json({ message: error.message }, { status: 400 });
    }

    return Response.json({ message: "创建订单失败，请稍后重试。" }, { status: 500 });
  }
}
