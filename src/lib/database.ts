import { prisma } from "@/lib/prisma";
import { getDatabaseName, getDatabaseUrl } from "@/lib/env";
import type {
  CheckoutFormData,
  Order,
  SessionUser,
} from "@/types/store";

export type DataAccessMode = "mysql" | "file";

type DatabaseOrderItemInput = {
  id: string;
  quantity: number;
};

type LoginUserRecord = {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
};

const DEV_AUTH_SECRET = "nextmail-dev-secret-change-me";

export function isDatabaseConfigured() {
  return Boolean(getDatabaseUrl() && getDatabaseName());
}

export function hasAuthSecret() {
  return Boolean(process.env.AUTH_SECRET);
}

export function getSessionSecret() {
  return process.env.AUTH_SECRET || DEV_AUTH_SECRET;
}

export function getDataAccessMode(): DataAccessMode {
  return isDatabaseConfigured() ? "mysql" : "file";
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function findUserIdByEmail(email: string) {
  return prisma.customerUser.findUnique({
    where: { email: normalizeEmail(email) },
    select: { id: true },
  });
}

export async function findUserForLogin(email: string): Promise<LoginUserRecord | null> {
  return prisma.customerUser.findUnique({
    where: { email: normalizeEmail(email) },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
    },
  });
}

export async function createUserRecord(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<SessionUser> {
  return prisma.customerUser.create({
    data: {
      email: normalizeEmail(input.email),
      name: input.name,
      passwordHash: input.passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

export async function findSessionUserById(userId: string): Promise<SessionUser | null> {
  return prisma.customerUser.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });
}

function mergeOrderItems(items: DatabaseOrderItemInput[]) {
  const quantityMap = new Map<string, number>();

  items.forEach((item) => {
    quantityMap.set(item.id, (quantityMap.get(item.id) ?? 0) + item.quantity);
  });

  return Array.from(quantityMap.entries()).map(([id, quantity]) => ({
    id,
    quantity,
  }));
}

export async function createOrderRecord(
  userId: string,
  input: CheckoutFormData & { items: DatabaseOrderItemInput[] },
) {
  const mergedItems = mergeOrderItems(input.items);
  const productIds = mergedItems.map((item) => item.id);

  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    if (products.length !== productIds.length) {
      throw new Error("Some products do not exist or are no longer available.");
    }

    const productMap = new Map(products.map((product) => [product.id, product]));
    const orderItems = mergedItems.map((item) => {
      const product = productMap.get(item.id);

      if (!product) {
        throw new Error("Some products do not exist or are no longer available.");
      }

      if (product.inventory < item.quantity) {
        throw new Error(`${product.name} is out of stock for the requested quantity.`);
      }

      const productPrice = Number(product.price);

      return {
        productId: product.id,
        productName: product.name,
        productPrice,
        quantity: item.quantity,
        lineTotal: productPrice * item.quantity,
      };
    });

    const totalAmount = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

    const order = await tx.order.create({
      data: {
        userId,
        status: "PENDING",
        totalAmount,
        receiverName: input.receiverName,
        receiverPhone: input.receiverPhone,
        receiverEmail: input.receiverEmail,
        receiverAddress: input.receiverAddress,
        note: input.note,
        items: {
          create: orderItems,
        },
      },
      select: {
        id: true,
      },
    });

    await Promise.all(
      orderItems.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        }),
      ),
    );

    return order;
  });
}

export async function readOrdersByUserId(userId: string): Promise<Order[]> {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return orders.map((order) => ({
    id: order.id,
    userId: order.userId,
    status: order.status,
    totalAmount: order.totalAmount,
    receiverName: order.receiverName,
    receiverPhone: order.receiverPhone,
    receiverEmail: order.receiverEmail,
    receiverAddress: order.receiverAddress,
    note: order.note ?? undefined,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
  }));
}
