import { readStoreData, writeStoreData } from "@/lib/store";
import type { StoreData } from "@/types/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const store = await readStoreData();

    return Response.json(store);
  } catch {
    return Response.json({ message: "读取店铺配置失败。" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = (await request.json()) as Partial<StoreData>;

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return Response.json({ message: "请求体必须是一个对象。" }, { status: 400 });
    }

    const nextData = await writeStoreData(payload);

    return Response.json(nextData);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json({ message: "请求体不是合法的 JSON。" }, { status: 400 });
    }

    return Response.json({ message: "保存店铺配置失败。" }, { status: 500 });
  }
}
