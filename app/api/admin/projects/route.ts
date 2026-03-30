import { NextResponse } from "next/server";
import { validateAdminRequest } from "../../../../lib/admin";
import { deleteProject, saveProject } from "../../../../lib/projects";

export async function POST(request: Request) {
  try {
    const validation = validateAdminRequest(request);

    if (!validation.ok) {
      return NextResponse.json({ message: validation.message }, { status: validation.status });
    }

    const body = await request.json();

    const slug = await saveProject({
      title: String(body.title || ""),
      slug: String(body.slug || ""),
      originalSlug: String(body.originalSlug || ""),
      summary: String(body.summary || ""),
      pinned: Boolean(body.pinned),
      status: body.status === "In Progress" ? "In Progress" : "Delivered",
      role: String(body.role || ""),
      stack: Array.isArray(body.stack) ? body.stack.map(String) : [],
      outcome: String(body.outcome || ""),
      coverImage: String(body.coverImage || ""),
      content: String(body.content || ""),
    });

    return NextResponse.json({ message: "Project saved.", slug });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to save project." },
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

    await deleteProject(slug);

    return NextResponse.json({ message: "Project deleted.", slug });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to delete project." },
      { status: 500 },
    );
  }
}
