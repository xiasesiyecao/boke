import { writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { validateAdminRequest } from "../../../../lib/admin";
import { ensureUploadsDir, getUploadsDir, normalizeSlug } from "../../../../lib/content-paths";

export async function POST(request: Request) {
  try {
    const validation = validateAdminRequest(request);

    if (!validation.ok) {
      return NextResponse.json({ message: validation.message }, { status: validation.status });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No file uploaded." }, { status: 400 });
    }

    await ensureUploadsDir();

    const ext = path.extname(file.name) || ".bin";
    const baseName = path.basename(file.name, ext);
    const fileName = `${Date.now()}-${normalizeSlug(baseName)}${ext.toLowerCase()}`;
    const targetPath = path.join(getUploadsDir(), fileName);
    const arrayBuffer = await file.arrayBuffer();

    await writeFile(targetPath, Buffer.from(arrayBuffer));

    return NextResponse.json({
      message: "File uploaded.",
      url: `/media/${fileName}`,
      fileName,
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to upload file." },
      { status: 500 },
    );
  }
}
