import { NextResponse } from "next/server";
import { validateAdminRequest } from "../../../../lib/admin";
import { deleteBlogPost, saveBlogPost } from "../../../../lib/blog";

export async function POST(request: Request) {
  try {
    const validation = validateAdminRequest(request);

    if (!validation.ok) {
      return NextResponse.json({ message: validation.message }, { status: validation.status });
    }

    const body = await request.json();

    const slug = await saveBlogPost({
      title: String(body.title || ""),
      slug: String(body.slug || ""),
      originalSlug: String(body.originalSlug || ""),
      category: String(body.category || "AI Practice"),
      summary: String(body.summary || ""),
      pinned: Boolean(body.pinned),
      status: body.status === "Published" ? "Published" : "Draft",
      readingTime: String(body.readingTime || "5 min read"),
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      publishedAt: String(body.publishedAt || new Date().toISOString().slice(0, 10)),
      coverImage: String(body.coverImage || ""),
      content: String(body.content || ""),
    });

    return NextResponse.json({ message: "Blog post saved.", slug });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to save blog post." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const validation = validateAdminRequest(request);

    if (!validation.ok) {
      return NextResponse.json({ message: validation.message }, { status: validation.status });
    }

    const body = await request.json();
    const slug = String(body.slug || "");

    if (!slug) {
      return NextResponse.json({ message: "Slug is required." }, { status: 400 });
    }

    await deleteBlogPost(slug);

    return NextResponse.json({ message: "Blog post deleted.", slug });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete blog post." },
      { status: 500 },
    );
  }
}
