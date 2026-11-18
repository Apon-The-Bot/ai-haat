import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { sanitizeProfileImageUrl } from "@/lib/profile-image";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const user = await prisma.user.findUnique({ where: { id: auth.user.id }, select: { id: true, name: true, email: true, phone: true, image: true, profileImageSource: true, googleImage: true } });
  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const data: { name?: string | null; phone?: string | null; image?: string | null; profileImageSource?: string | null } = {};
  if ("name" in body) {
    if (body.name !== null && (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.trim().length > 100)) return NextResponse.json({ error: "Name must be 2-100 characters" }, { status: 400 });
    data.name = body.name === null ? null : body.name.trim();
  }
  if ("phone" in body) {
    if (body.phone !== null && (typeof body.phone !== "string" || body.phone.trim().length > 30)) return NextResponse.json({ error: "Phone number is invalid" }, { status: 400 });
    data.phone = body.phone === null ? null : body.phone.trim();
  }
  if ("image" in body) {
    if (body.image === null || body.image === "") {
      const current = await prisma.user.findUnique({ where: { id: auth.user.id }, select: { googleImage: true } });
      data.image = current?.googleImage || null;
      data.profileImageSource = current?.googleImage ? "GOOGLE" : null;
    } else {
      const image = sanitizeProfileImageUrl(body.image);
      if (!image) return NextResponse.json({ error: "Unsupported profile image URL" }, { status: 400 });
      data.image = image;
      data.profileImageSource = "CUSTOM";
    }
  }
  const user = await prisma.user.update({ where: { id: auth.user.id }, data, select: { id: true, name: true, email: true, phone: true, image: true, profileImageSource: true } });
  return NextResponse.json({ success: true, user });
}
