import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getUploadsDir } from "../../../lib/content-paths";

const contentTypes: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

type MediaRouteProps = {
  params: {
    fileName: string;
  };
};

export async function GET(_request: Request, { params }: MediaRouteProps) {
  try {
    const safeFileName = path.basename(params.fileName);
    const filePath = path.join(getUploadsDir(), safeFileName);
    const file = await readFile(filePath);
    const ext = path.extname(safeFileName).toLowerCase();

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentTypes[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ message: "File not found." }, { status: 404 });
  }
}
