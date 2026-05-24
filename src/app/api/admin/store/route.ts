import { readStoreData, writeStoreData } from "@/lib/store";
import type { StoreData } from "@/types/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await readStoreData();

  return Response.json(store);
}

export async function PUT(request: Request) {
  const payload = (await request.json()) as Partial<StoreData>;
  const nextData = await writeStoreData(payload);

  return Response.json(nextData);
}

