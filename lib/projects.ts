import { readdir, readFile, writeFile } from "node:fs/promises";
import { rm } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { sortProjectLikeItems } from "./content-sort";
import { ensureContentDir, getContentDir, normalizeSlug } from "./content-paths";

export type ProjectMeta = {
  slug: string;
  title: string;
  summary: string;
  pinned: boolean;
  status: "Delivered" | "In Progress";
  role: string;
  stack: string[];
  outcome: string;
  coverImage?: string;
};

export type Project = ProjectMeta & {
  content: string;
};

export type SaveProjectInput = {
  title: string;
  slug?: string;
  originalSlug?: string;
  summary: string;
  pinned: boolean;
  status: "Delivered" | "In Progress";
  role: string;
  stack: string[];
  outcome: string;
  content: string;
  coverImage?: string;
};

const PROJECT_DIR = getContentDir("projects");

function getProjectFilePath(slug: string) {
  return path.join(PROJECT_DIR, `${slug}.md`);
}

async function readProjectFile(filePath: string) {
  const file = await readFile(filePath, "utf8");
  const { data, content } = matter(file);
  const slug = path.basename(filePath, ".md");

  return {
    slug,
    title: String(data.title || slug),
    summary: String(data.summary || ""),
    pinned: Boolean(data.pinned),
    status: data.status === "In Progress" ? "In Progress" : "Delivered",
    role: String(data.role || ""),
    stack: Array.isArray(data.stack) ? data.stack.map(String) : [],
    outcome: String(data.outcome || ""),
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    content,
  } satisfies Project;
}

export async function getAllProjects() {
  await ensureContentDir("projects");

  const fileNames = await readdir(PROJECT_DIR);
  const items = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => readProjectFile(path.join(PROJECT_DIR, fileName))),
  );

  return sortProjects(items);
}

export async function getProject(slug: string) {
  try {
    await ensureContentDir("projects");
    return await readProjectFile(getProjectFilePath(slug));
  } catch {
    return null;
  }
}

export async function saveProject(input: SaveProjectInput) {
  await ensureContentDir("projects");

  const slug = normalizeSlug(input.slug || input.title);
  const filePath = getProjectFilePath(slug);
  const frontmatter = {
    title: input.title,
    summary: input.summary,
    pinned: input.pinned,
    status: input.status,
    role: input.role,
    stack: input.stack,
    outcome: input.outcome,
    ...(input.coverImage ? { coverImage: input.coverImage } : {}),
  };
  const fileContent = matter.stringify(`${input.content.trim()}\n`, {
    ...frontmatter,
  });

  await writeFile(filePath, fileContent, "utf8");

  if (input.originalSlug && input.originalSlug !== slug) {
    await rm(getProjectFilePath(input.originalSlug), { force: true });
  }

  return slug;
}

export async function deleteProject(slug: string) {
  await ensureContentDir("projects");
  await rm(getProjectFilePath(slug), { force: true });
}

export function sortProjects(projects: Project[]) {
  return sortProjectLikeItems(projects);
}
