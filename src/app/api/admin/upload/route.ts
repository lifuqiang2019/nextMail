import { NextResponse } from "next/server";

import { ensureAdminApiAccess } from "@/lib/admin/guards";

type UploadResponse = {
  fileName: string;
  url: string;
  size: string;
  contentType: string;
  createdAt: string;
};

export async function POST(request: Request) {
  const access = await ensureAdminApiAccess();
  if (access.response) return access.response;

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Please select an image file." }, { status: 400 });
  }

  const upstreamFormData = new FormData();
  upstreamFormData.append("file", file, file.name);

  const upstreamResponse = await fetch("https://file.aoobooc.me/api/upload", {
    method: "POST",
    body: upstreamFormData,
  });

  const rawBody = await upstreamResponse.text();
  const payload = rawBody ? tryParseUploadResponse(rawBody) : null;

  if (!upstreamResponse.ok || !payload?.url) {
    return NextResponse.json(
      {
        message:
          (payload && "message" in payload && typeof payload.message === "string" && payload.message) ||
          "Image upload failed.",
      },
      { status: upstreamResponse.status || 502 },
    );
  }

  return NextResponse.json({
    fileName: payload.fileName ?? file.name,
    url: String(payload.url).trim(),
    size: payload.size ?? String(file.size),
    contentType: payload.contentType ?? file.type,
    createdAt: payload.createdAt ?? new Date().toISOString(),
  } satisfies UploadResponse);
}

function tryParseUploadResponse(rawBody: string): Partial<UploadResponse & { message?: string }> | null {
  try {
    return JSON.parse(rawBody) as Partial<UploadResponse & { message?: string }>;
  } catch {
    return null;
  }
}
