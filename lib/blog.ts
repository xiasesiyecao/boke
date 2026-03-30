import { readdir, readFile, writeFile } from "node:fs/promises";
import { rm } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { sortBlogLikeItems } from "./content-sort";
import { ensureContentDir, getContentDir, normalizeSlug } from "./content-paths";

export type BlogPostMeta = {
  slug: string;
  title: string;
  category: string;
  summary: string;
  pinned: boolean;
  status: "Draft" | "Published";
  readingTime: string;
  tags: string[];
  publishedAt: string;
  coverImage?: string;
};

export type BlogPost = BlogPostMeta & {
  content: string;
};

export type SaveBlogPostInput = {
  title: string;
  slug?: string;
  originalSlug?: string;
  category: string;
  summary: string;
  pinned: boolean;
  status: "Draft" | "Published";
  readingTime: string;
  tags: string[];
  publishedAt: string;
  content: string;
  coverImage?: string;
};

const BLOG_DIR = getContentDir("blog");

function getBlogFilePath(slug: string) {
  return path.join(BLOG_DIR, `${slug}.md`);
}

async function readBlogFile(filePath: string) {
  const file = await readFile(filePath, "utf8");
  const { data, content } = matter(file);
  const slug = path.basename(filePath, ".md");

  return {
    slug,
    title: String(data.title || slug),
    category: String(data.category || "AI Practice"),
    summary: String(data.summary || ""),
    pinned: Boolean(data.pinned),
    status: data.status === "Published" ? "Published" : "Draft",
    readingTime: String(data.readingTime || "5 min read"),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    publishedAt: String(data.publishedAt || new Date().toISOString().slice(0, 10)),
    coverImage: data.coverImage ? String(data.coverImage) : undefined,
    content,
  } satisfies BlogPost;
}

export async function getAllBlogPosts() {
  await ensureContentDir("blog");

  const fileNames = await readdir(BLOG_DIR);
  const posts = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".md"))
      .map((fileName) => readBlogFile(path.join(BLOG_DIR, fileName))),
  );

  return sortBlogPosts(posts);
}

export async function getBlogPost(slug: string) {
  try {
    await ensureContentDir("blog");
    return await readBlogFile(getBlogFilePath(slug));
  } catch {
    return null;
  }
}

export async function saveBlogPost(input: SaveBlogPostInput) {
  await ensureContentDir("blog");

  const slug = normalizeSlug(input.slug || input.title);
  const filePath = getBlogFilePath(slug);
  const frontmatter = {
    title: input.title,
    category: input.category,
    summary: input.summary,
    pinned: input.pinned,
    status: input.status,
    readingTime: input.readingTime,
    tags: input.tags,
    publishedAt: input.publishedAt,
    ...(input.coverImage ? { coverImage: input.coverImage } : {}),
  };
  const fileContent = matter.stringify(`${input.content.trim()}\n`, {
    ...frontmatter,
  });

  await writeFile(filePath, fileContent, "utf8");

  if (input.originalSlug && input.originalSlug !== slug) {
    await rm(getBlogFilePath(input.originalSlug), { force: true });
  }

  return slug;
}

export async function deleteBlogPost(slug: string) {
  await ensureContentDir("blog");
  await rm(getBlogFilePath(slug), { force: true });
}

export function sortBlogPosts(posts: BlogPost[]) {
  return sortBlogLikeItems(posts);
}
