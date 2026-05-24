import { readStoreData } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const store = await readStoreData();

  return Response.json(store);
}
