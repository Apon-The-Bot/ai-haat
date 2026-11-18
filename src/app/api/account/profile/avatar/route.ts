import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { optimizeAndStoreImage } from "@/lib/media/optimizer";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Please choose an image up to 10MB" }, { status: 400 });
  try {
    const result = await optimizeAndStoreImage(Buffer.from(await file.arrayBuffer()), file.name);
    const user = await prisma.user.update({ where: { id: auth.user.id }, data: { image: result.url, profileImageSource: "CUSTOM" }, select: { image: true, profileImageSource: true } });
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Image upload failed" }, { status: 400 });
  }
}
