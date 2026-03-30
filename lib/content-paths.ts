import { mkdir } from "node:fs/promises";
import path from "node:path";

export type ContentKind = "blog" | "projects" | "labs";

export function getContentRoot() {
  return path.resolve(process.cwd(), process.env.CONTENT_STORAGE_DIR || "content-store");
}

export function getContentDir(kind: ContentKind) {
  return path.join(getContentRoot(), kind);
}

export async function ensureContentDir(kind: ContentKind) {
  await mkdir(getContentDir(kind), { recursive: true });
}

export function getUploadsDir() {
  return path.join(getContentRoot(), "uploads");
}

export async function ensureUploadsDir() {
  await mkdir(getUploadsDir(), { recursive: true });
}

export function normalizeSlug(input: string) {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || `entry-${Date.now()}`;
}
