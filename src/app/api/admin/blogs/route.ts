import { requireAdminMfa } from "@/lib/auth-guard";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAdminAudit } from "@/lib/audit-logger";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;

  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });

    const formatted = blogs.map((b) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      category: b.category,
      image: b.image,
      excerpt: b.excerpt,
      content: b.content,
      readTime: b.readTime,
      published: b.published,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, blogs: formatted });
  } catch (error: any) {
    console.error("[Admin Blogs GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const body = await req.json();
    const { title, slug, category, excerpt, content, image, readTime } = body;

    if (!title || !excerpt) {
      return NextResponse.json({ error: "Title and content/summary are required." }, { status: 400 });
    }

    const cleanSlug = slug
      ? slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")
      : title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");

    const newBlog = await prisma.blog.create({
      data: {
        title: title.trim(),
        slug: cleanSlug,
        category: category || "AI & Tech",
        image: image || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600",
        excerpt: excerpt.trim(),
        content: content ? content.trim() : excerpt.trim(),
        readTime: readTime || "4 mins read",
        published: true,
      },
    });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "BLOG_CREATE",
      targetType: "BLOG",
      targetId: newBlog.id,
      details: { title: newBlog.title, slug: newBlog.slug },
    });

    return NextResponse.json({ success: true, blog: newBlog });
  } catch (error: any) {
    console.error("[Admin Blogs POST Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to create article" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAdminMfa();
  if (auth instanceof NextResponse) return auth;
  const { user } = auth;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
    }

    await prisma.blog.delete({ where: { id } });

    await logAdminAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "BLOG_DELETE",
      targetType: "BLOG",
      targetId: id,
    });

    return NextResponse.json({ success: true, message: "Article deleted successfully." });
  } catch (error: any) {
    console.error("[Admin Blogs DELETE Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete article" }, { status: 500 });
  }
}
