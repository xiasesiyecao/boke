import { readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { sortProjectLikeItems } from "./content-sort";
import { ensureContentDir, getContentDir, normalizeSlug } from "./content-paths";

export type LabModule = "Game Dev" | "Ops Scripts" | "Idea Experiments" | "Backlog";
export type LabStatus = "Planned" | "Active" | "Open" | "Reserved";

export type LabMeta = {
  slug: string;
  title: string;
  module: LabModule;
  summary: string;
  pinned: boolean;
  status: LabStatus;
  tags: string[];
  coverImage?: string;
};

export type Lab = LabMeta & {
  content: string;
};

export type SaveLabInput = {
  title: string;
  slug?: string;
  originalSlug?: string;
  module: LabModule;
  summary: string;
  pinned: boolean;
  status: LabStatus;
  tags: string[];
  coverImage?: string;
  content: string;
};

const LABS_DIR = getContentDir("labs");

function getLabFilePath(slug: string) {
  return path.join(LABS_DIR, `${slug}.md`);
}

async function readLabFile(filePath: string) {
  const file = await readFile(filePath, "utf8");
  const { data, content } = matter(file);
  const slug = path.basename(filePath, ".md");

  const module = String(data.module || "Idea Experiments");
  const status = String(data.status || "Open");

  return {
    slug,
    title: String(data.title || slug),
    module:
      module === "Game Dev" ||
      module === "Ops Scripts" ||
      module === "Idea Experiments" ||
      module === "Backlog"
        ? module
        : "Idea Experiments",
    summary: String(data.summary || ""),
    pinned: Boolean(data.pinned),
    status:
      status === "Planned" || status === "Active" || status === "Reserved" ? status : "Open",
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    content,
  } satisfies Lab;
}

export async function getAllLabs() {
  await ensureContentDir("labs");

  const fileNames = await readdir(LABS_DIR);
  const items = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => readLabFile(path.join(LABS_DIR, fileName))),
  );

  return sortLabs(items);
}

export async function getLab(slug: string) {
  try {
    await ensureContentDir("labs");
    return await readLabFile(getLabFilePath(slug));
  } catch {
    return null;
  }
}

export async function saveLab(input: SaveLabInput) {
  await ensureContentDir("labs");

  const slug = normalizeSlug(input.slug || input.title);
  const filePath = getLabFilePath(slug);
  const frontmatter = {
    title: input.title,
    module: input.module,
    summary: input.summary,
    pinned: input.pinned,
    status: input.status,
    tags: input.tags,
    ...(input.coverImage ? { coverImage: input.coverImage } : {}),
  };
  const fileContent = matter.stringify(`${input.content.trim()}\n`, frontmatter);

  await writeFile(filePath, fileContent, "utf8");

  if (input.originalSlug && input.originalSlug !== slug) {
    await rm(getLabFilePath(input.originalSlug), { force: true });
  }

  return slug;
}

export async function deleteLab(slug: string) {
  await ensureContentDir("labs");
  await rm(getLabFilePath(slug), { force: true });
}

export function sortLabs(labs: Lab[]) {
  return sortProjectLikeItems(labs);
}
