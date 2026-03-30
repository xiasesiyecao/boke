import { NextResponse } from "next/server";
import { validateAdminRequest } from "../../../../lib/admin";
import { deleteLab, saveLab } from "../../../../lib/labs";

export async function POST(request: Request) {
  try {
    const validation = validateAdminRequest(request);

    if (!validation.ok) {
      return NextResponse.json({ message: validation.message }, { status: validation.status });
    }

    const body = await request.json();

    const slug = await saveLab({
      title: String(body.title || ""),
      slug: String(body.slug || ""),
      originalSlug: String(body.originalSlug || ""),
      module:
        body.module === "Game Dev" ||
        body.module === "Ops Scripts" ||
        body.module === "Backlog"
          ? body.module
          : "Idea Experiments",
      summary: String(body.summary || ""),
      pinned: Boolean(body.pinned),
      status:
        body.status === "Planned" ||
        body.status === "Active" ||
        body.status === "Reserved"
          ? body.status
          : "Open",
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      coverImage: String(body.coverImage || ""),
      content: String(body.content || ""),
    });

    return NextResponse.json({ message: "Lab item saved.", slug });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to save lab item." },
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

    await deleteLab(slug);

    return NextResponse.json({ message: "Lab item deleted.", slug });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete lab item." },
      { status: 500 },
    );
  }
}
