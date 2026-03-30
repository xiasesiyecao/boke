"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Area } from "react-easy-crop";
import { ImageCropDialog } from "./image-crop-dialog";
import { sortBlogLikeItems, sortProjectLikeItems } from "../lib/content-sort";
import { cropImageFile } from "../lib/client-image";
import type { BlogPost } from "../lib/blog";
import type { Project } from "../lib/projects";

type StudioPanelProps = {
  posts: BlogPost[];
  projects: Project[];
  initialBlogSlug?: string;
  initialProjectSlug?: string;
  initialAuthenticated: boolean;
};

const pageSize = 5;

const initialBlog = {
  originalSlug: "",
  title: "",
  slug: "",
  category: "AI Practice",
  summary: "",
  pinned: false,
  status: "Draft",
  readingTime: "5 min read",
  tags: "",
  publishedAt: new Date().toISOString().slice(0, 10),
  coverImage: "",
  content: "",
};

const initialProject = {
  originalSlug: "",
  title: "",
  slug: "",
  summary: "",
  pinned: false,
  status: "Delivered",
  role: "",
  stack: "",
  outcome: "",
  coverImage: "",
  content: "",
};

function splitCommaValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function blogToForm(post: BlogPost) {
  return {
    title: post.title,
    originalSlug: post.slug,
    slug: post.slug,
    category: post.category,
    summary: post.summary,
    pinned: post.pinned,
    status: post.status,
    readingTime: post.readingTime,
    tags: post.tags.join(", "),
    publishedAt: post.publishedAt,
    coverImage: post.coverImage || "",
    content: post.content,
  };
}

function projectToForm(project: Project) {
  return {
    title: project.title,
    originalSlug: project.slug,
    slug: project.slug,
    summary: project.summary,
    pinned: project.pinned,
    status: project.status,
    role: project.role,
    stack: project.stack.join(", "),
    outcome: project.outcome,
    coverImage: project.coverImage || "",
    content: project.content,
  };
}

export function StudioPanel({
  posts,
  projects,
  initialBlogSlug,
  initialProjectSlug,
  initialAuthenticated,
}: StudioPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState("");
  const [blogItems, setBlogItems] = useState(posts);
  const [projectItems, setProjectItems] = useState(projects);
  const [blogSearch, setBlogSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [blogStatusFilter, setBlogStatusFilter] = useState<"All" | "Draft" | "Published">("All");
  const [projectStatusFilter, setProjectStatusFilter] = useState<
    "All" | "Delivered" | "In Progress"
  >("All");
  const [blogSort, setBlogSort] = useState<"pinned" | "latest" | "title">("pinned");
  const [projectSort, setProjectSort] = useState<"pinned" | "title" | "status">("pinned");
  const [blogPage, setBlogPage] = useState(1);
  const [projectPage, setProjectPage] = useState(1);
  const [blogForm, setBlogForm] = useState(() => {
    const selected = initialBlogSlug ? posts.find((item) => item.slug === initialBlogSlug) : null;
    return selected ? blogToForm(selected) : initialBlog;
  });
  const [projectForm, setProjectForm] = useState(() => {
    const selected = initialProjectSlug
      ? projects.find((item) => item.slug === initialProjectSlug)
      : null;
    return selected ? projectToForm(selected) : initialProject;
  });
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "success" | "error">("info");
  const [pending, setPending] = useState<"blog" | "project" | "upload" | "session" | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropPreviewUrl, setCropPreviewUrl] = useState("");
  const blogContentRef = useRef<HTMLTextAreaElement | null>(null);
  const projectContentRef = useRef<HTMLTextAreaElement | null>(null);
  const inBlogEditor = pathname.startsWith("/studio/blog/");
  const inProjectEditor = pathname.startsWith("/studio/projects/");

  async function readJsonSafe(response: Response) {
    const text = await response.text();

    if (!text.trim()) {
      return {};
    }

    try {
      return JSON.parse(text) as Record<string, unknown>;
    } catch {
      return {
        message: `Unexpected response: ${text.slice(0, 160)}`,
      };
    }
  }

  function buildAdminHeaders(includeJson = false) {
    const headers: Record<string, string> = {};

    if (includeJson) {
      headers["Content-Type"] = "application/json";
    }

    if (token.trim()) {
      headers["x-admin-token"] = token.trim();
    }

    return headers;
  }

  function setFeedback(nextMessage: string, tone: "info" | "success" | "error" = "info") {
    setMessage(nextMessage);
    setMessageTone(tone);
  }

  function insertMarkdownAtCursor(kind: "blog" | "project", markdown: string) {
    if (kind === "blog") {
      const textarea = blogContentRef.current;

      setBlogForm((prev) => {
        if (!textarea) {
          return {
            ...prev,
            content: `${prev.content}${prev.content.endsWith("\n") ? "" : "\n"}${markdown}\n`,
          };
        }

        const start = textarea.selectionStart ?? prev.content.length;
        const end = textarea.selectionEnd ?? start;
        const nextContent = `${prev.content.slice(0, start)}${markdown}${prev.content.slice(end)}`;

        requestAnimationFrame(() => {
          textarea.focus();
          const cursor = start + markdown.length;
          textarea.setSelectionRange(cursor, cursor);
        });

        return {
          ...prev,
          content: nextContent,
        };
      });

      return;
    }

    const textarea = projectContentRef.current;

    setProjectForm((prev) => {
      if (!textarea) {
        return {
          ...prev,
          content: `${prev.content}${prev.content.endsWith("\n") ? "" : "\n"}${markdown}\n`,
        };
      }

      const start = textarea.selectionStart ?? prev.content.length;
      const end = textarea.selectionEnd ?? start;
      const nextContent = `${prev.content.slice(0, start)}${markdown}${prev.content.slice(end)}`;

      requestAnimationFrame(() => {
        textarea.focus();
        const cursor = start + markdown.length;
        textarea.setSelectionRange(cursor, cursor);
      });

      return {
        ...prev,
        content: nextContent,
      };
    });
  }

  const filteredBlogItems = useMemo(() => {
    const query = blogSearch.trim().toLowerCase();
    const filtered = blogItems.filter((post) => {
      const matchesQuery =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.slug.toLowerCase().includes(query) ||
        post.category.toLowerCase().includes(query);
      const matchesStatus = blogStatusFilter === "All" || post.status === blogStatusFilter;

      return matchesQuery && matchesStatus;
    });

    if (blogSort === "latest") {
      return [...filtered].sort((left, right) => right.publishedAt.localeCompare(left.publishedAt));
    }

    if (blogSort === "title") {
      return [...filtered].sort((left, right) => left.title.localeCompare(right.title));
    }

    return sortBlogLikeItems(filtered);
  }, [blogItems, blogSearch, blogSort, blogStatusFilter]);

  const filteredProjectItems = useMemo(() => {
    const query = projectSearch.trim().toLowerCase();
    const filtered = projectItems.filter((project) => {
      const matchesQuery =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.slug.toLowerCase().includes(query) ||
        project.role.toLowerCase().includes(query);
      const matchesStatus = projectStatusFilter === "All" || project.status === projectStatusFilter;

      return matchesQuery && matchesStatus;
    });

    if (projectSort === "title") {
      return [...filtered].sort((left, right) => left.title.localeCompare(right.title));
    }

    if (projectSort === "status") {
      return [...filtered].sort((left, right) => left.status.localeCompare(right.status));
    }

    return sortProjectLikeItems(filtered);
  }, [projectItems, projectSearch, projectSort, projectStatusFilter]);

  useEffect(() => {
    setBlogPage(1);
  }, [blogSearch, blogStatusFilter, blogSort]);

  useEffect(() => {
    setProjectPage(1);
  }, [projectSearch, projectStatusFilter, projectSort]);

  const blogPageCount = Math.max(1, Math.ceil(filteredBlogItems.length / pageSize));
  const projectPageCount = Math.max(1, Math.ceil(filteredProjectItems.length / pageSize));
  const pagedBlogItems = filteredBlogItems.slice((blogPage - 1) * pageSize, blogPage * pageSize);
  const pagedProjectItems = filteredProjectItems.slice(
    (projectPage - 1) * pageSize,
    projectPage * pageSize,
  );

  useEffect(() => {
    if (blogPage > blogPageCount) {
      setBlogPage(blogPageCount);
    }
  }, [blogPage, blogPageCount]);

  useEffect(() => {
    if (projectPage > projectPageCount) {
      setProjectPage(projectPageCount);
    }
  }, [projectPage, projectPageCount]);

  async function loginSession() {
    setPending("session");
    setFeedback("", "info");

    const response = await fetch("/api/admin/session", {
      method: "POST",
      credentials: "same-origin",
      headers: buildAdminHeaders(),
    });

    const result = await readJsonSafe(response);
    setPending(null);
    setFeedback(String(result.message || "Logged in."), response.ok ? "success" : "error");

    if (response.ok) {
      setAuthenticated(true);
    }
  }

  async function logoutSession() {
    setPending("session");
    setFeedback("", "info");

    const response = await fetch("/api/admin/session", {
      method: "DELETE",
      credentials: "same-origin",
    });

    const result = await readJsonSafe(response);
    setPending(null);
    setFeedback(String(result.message || "Logged out."), response.ok ? "success" : "error");

    if (response.ok) {
      setAuthenticated(false);
      setToken("");
    }
  }

  async function submitBlog() {
    setPending("blog");
    setFeedback("", "info");

    const response = await fetch("/api/admin/blog", {
      method: "POST",
      credentials: "same-origin",
      headers: buildAdminHeaders(true),
      body: JSON.stringify({
        ...blogForm,
        originalSlug: blogForm.originalSlug,
        pinned: blogForm.pinned,
        tags: splitCommaValues(blogForm.tags),
      }),
    });

    const result = await readJsonSafe(response);
    setPending(null);
    setFeedback(String(result.message || "Saved."), response.ok ? "success" : "error");

    if (response.ok) {
      const savedSlug = String(result.slug || blogForm.slug);
      const savedItem = {
        slug: savedSlug,
        title: blogForm.title,
        category: blogForm.category,
        summary: blogForm.summary,
        pinned: blogForm.pinned,
        status: blogForm.status as "Draft" | "Published",
        readingTime: blogForm.readingTime,
        tags: splitCommaValues(blogForm.tags),
        publishedAt: blogForm.publishedAt,
        coverImage: blogForm.coverImage || undefined,
        content: blogForm.content,
      } satisfies BlogPost;

      setBlogItems((prev) => {
        const next = prev.filter(
          (item) => item.slug !== savedSlug && item.slug !== blogForm.originalSlug,
        );
        return sortBlogLikeItems([savedItem, ...next]);
      });
      setBlogForm((prev) => ({
        ...prev,
        originalSlug: savedSlug,
        slug: savedSlug,
      }));
      if (pathname.startsWith("/studio/blog/") && pathname !== `/studio/blog/${savedSlug}`) {
        router.replace(`/studio/blog/${savedSlug}`);
      }
    }
  }

  async function submitProject() {
    setPending("project");
    setFeedback("", "info");

    const response = await fetch("/api/admin/projects", {
      method: "POST",
      credentials: "same-origin",
      headers: buildAdminHeaders(true),
      body: JSON.stringify({
        ...projectForm,
        originalSlug: projectForm.originalSlug,
        pinned: projectForm.pinned,
        stack: splitCommaValues(projectForm.stack),
      }),
    });

    const result = await readJsonSafe(response);
    setPending(null);
    setFeedback(String(result.message || "Saved."), response.ok ? "success" : "error");

    if (response.ok) {
      const savedSlug = String(result.slug || projectForm.slug);
      const savedItem = {
        slug: savedSlug,
        title: projectForm.title,
        summary: projectForm.summary,
        pinned: projectForm.pinned,
        status: projectForm.status as "Delivered" | "In Progress",
        role: projectForm.role,
        stack: splitCommaValues(projectForm.stack),
        outcome: projectForm.outcome,
        coverImage: projectForm.coverImage || undefined,
        content: projectForm.content,
      } satisfies Project;

      setProjectItems((prev) => {
        const next = prev.filter(
          (item) => item.slug !== savedSlug && item.slug !== projectForm.originalSlug,
        );
        return sortProjectLikeItems([...next, savedItem]);
      });
      setProjectForm((prev) => ({
        ...prev,
        originalSlug: savedSlug,
        slug: savedSlug,
      }));
      if (
        pathname.startsWith("/studio/projects/") &&
        pathname !== `/studio/projects/${savedSlug}`
      ) {
        router.replace(`/studio/projects/${savedSlug}`);
      }
    }
  }

  async function uploadImage(file: File) {
    setPending("upload");
    setFeedback("", "info");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      credentials: "same-origin",
      headers: buildAdminHeaders(),
      body: formData,
    });

    const result = await readJsonSafe(response);
    setPending(null);
    setFeedback(String(result.message || "Uploaded."), response.ok ? "success" : "error");

    if (response.ok) {
      const nextUrl = String(result.url || "");
      setUploadedUrl(nextUrl);
      if (pathname.startsWith("/studio/blog/")) {
        setBlogForm((prev) => ({
          ...prev,
          coverImage: prev.coverImage || nextUrl,
        }));
      }
      if (pathname.startsWith("/studio/projects/")) {
        setProjectForm((prev) => ({
          ...prev,
          coverImage: prev.coverImage || nextUrl,
        }));
      }
    }
  }

  async function confirmCrop({
    croppedAreaPixels,
  }: {
    croppedAreaPixels: Area;
    aspect: number;
  }) {
    if (!cropFile) {
      return;
    }

    try {
      const croppedFile = await cropImageFile(cropFile, croppedAreaPixels);
      await uploadImage(croppedFile);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "裁剪图片失败。", "error");
    } finally {
      if (cropPreviewUrl) {
        URL.revokeObjectURL(cropPreviewUrl);
      }
      setCropPreviewUrl("");
      setCropFile(null);
    }
  }

  async function deleteBlog() {
    if (!blogForm.slug || !confirm(`确认删除文章 "${blogForm.title}" 吗？`)) {
      return;
    }

    setPending("blog");
    setFeedback("", "info");

    const response = await fetch("/api/admin/blog", {
      method: "DELETE",
      credentials: "same-origin",
      headers: buildAdminHeaders(true),
      body: JSON.stringify({ slug: blogForm.originalSlug || blogForm.slug }),
    });

    const result = await readJsonSafe(response);
    setPending(null);
    setFeedback(String(result.message || "Deleted."), response.ok ? "success" : "error");

    if (response.ok) {
      const targetSlug = blogForm.originalSlug || blogForm.slug;
      setBlogItems((prev) => prev.filter((item) => item.slug !== targetSlug));
      setBlogForm(initialBlog);
      if (pathname.startsWith("/studio/blog/")) {
        router.replace("/studio");
      }
    }
  }

  async function deleteProjectItem() {
    if (!projectForm.slug || !confirm(`确认删除项目 "${projectForm.title}" 吗？`)) {
      return;
    }

    setPending("project");
    setFeedback("", "info");

    const response = await fetch("/api/admin/projects", {
      method: "DELETE",
      credentials: "same-origin",
      headers: buildAdminHeaders(true),
      body: JSON.stringify({ slug: projectForm.originalSlug || projectForm.slug }),
    });

    const result = await readJsonSafe(response);
    setPending(null);
    setFeedback(String(result.message || "Deleted."), response.ok ? "success" : "error");

    if (response.ok) {
      const targetSlug = projectForm.originalSlug || projectForm.slug;
      setProjectItems((prev) => prev.filter((item) => item.slug !== targetSlug));
      setProjectForm(initialProject);
      if (pathname.startsWith("/studio/projects/")) {
        router.replace("/studio");
      }
    }
  }

  return (
    <div className="studio-shell">
      <section className="studio-card">
        <span className="section-label">Studio Access</span>
        <h2>内容后台</h2>
        <p>这里通过 Next.js 内置 API 写入文件存储。上线后建议配合 HTTPS 和强密码 token 使用。</p>
        {!authenticated ? (
          <>
            <label className="studio-label">
              <span>Admin Token</span>
              <input
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="输入 ADMIN_TOKEN"
              />
            </label>
            <button
              type="button"
              className="primary-link studio-submit"
              onClick={loginSession}
              disabled={pending === "session" || !token}
            >
              {pending === "session" ? "登录中..." : "登录后台"}
            </button>
          </>
        ) : (
          <div className="studio-session-row">
            <strong>当前已登录后台，可直接编辑与上传。</strong>
            <button
              type="button"
              className="ghost-link studio-copy"
              onClick={logoutSession}
              disabled={pending === "session"}
            >
              退出登录
            </button>
          </div>
        )}
        {message ? (
          <div className={`studio-message studio-message-${messageTone}`}>{message}</div>
        ) : null}
      </section>

      {cropFile && cropPreviewUrl ? (
        <ImageCropDialog
          imageSrc={cropPreviewUrl}
          fileName={cropFile.name}
          onCancel={() => {
            URL.revokeObjectURL(cropPreviewUrl);
            setCropPreviewUrl("");
            setCropFile(null);
          }}
          onConfirm={confirmCrop}
        />
      ) : null}

      <div className="studio-grid">
        <section className="studio-card">
          <span className="section-label">Media Upload</span>
          <h2>上传图片</h2>
          <p>上传后会返回可直接插入 Markdown 的图片地址，适合文章和项目正文引用。</p>
          <label className="studio-label">
            <span>选择文件</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (file && (authenticated || token)) {
                  const previewUrl = URL.createObjectURL(file);
                  setCropFile(file);
                  setCropPreviewUrl(previewUrl);
                  event.currentTarget.value = "";
                }
              }}
            />
          </label>
          {uploadedUrl ? (
            <div className="studio-upload-result">
              <strong>{uploadedUrl}</strong>
              <div className="studio-action-row">
                <button
                  type="button"
                  className="ghost-link studio-copy"
                  onClick={() => navigator.clipboard.writeText(`![](${uploadedUrl})`)}
                >
                  复制 Markdown
                </button>
                <button
                  type="button"
                  className="ghost-link studio-copy"
                  onClick={() => {
                    if (inBlogEditor) {
                      insertMarkdownAtCursor("blog", `\n![](${uploadedUrl})\n`);
                    } else if (inProjectEditor) {
                      insertMarkdownAtCursor("project", `\n![](${uploadedUrl})\n`);
                    } else {
                      navigator.clipboard.writeText(`![](${uploadedUrl})`);
                    }
                  }}
                >
                  插入正文
                </button>
                <button
                  type="button"
                  className="ghost-link studio-copy"
                  onClick={() => {
                    if (inBlogEditor) {
                      setBlogForm((prev) => ({ ...prev, coverImage: uploadedUrl }));
                    }
                    if (inProjectEditor) {
                      setProjectForm((prev) => ({ ...prev, coverImage: uploadedUrl }));
                    }
                  }}
                >
                  设为封面
                </button>
              </div>
            </div>
          ) : null}
        </section>

        <section className="studio-card">
          <span className="section-label">Manage Existing</span>
          <h2>管理现有内容</h2>
          <div className="studio-manage-grid">
            <div>
              <span className="section-label">文章</span>
              <div className="studio-filter-bar">
                <label className="studio-label">
                  <span>搜索</span>
                  <input
                    value={blogSearch}
                    onChange={(event) => setBlogSearch(event.target.value)}
                    placeholder="按标题、slug、分类搜索"
                  />
                </label>
                <label className="studio-label">
                  <span>状态</span>
                  <select
                    value={blogStatusFilter}
                    onChange={(event) =>
                      setBlogStatusFilter(event.target.value as "All" | "Draft" | "Published")
                    }
                  >
                    <option value="All">All</option>
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </label>
                <label className="studio-label">
                  <span>排序</span>
                  <select
                    value={blogSort}
                    onChange={(event) =>
                      setBlogSort(event.target.value as "pinned" | "latest" | "title")
                    }
                  >
                    <option value="pinned">置顶优先</option>
                    <option value="latest">最新优先</option>
                    <option value="title">标题排序</option>
                  </select>
                </label>
              </div>
              <div className="studio-filter-meta">
                当前显示 {filteredBlogItems.length} / {blogItems.length} 篇文章
              </div>
              <div className="studio-existing-list">
                {pagedBlogItems.map((post) => (
                  <div key={post.slug} className="studio-existing-card">
                    <button
                      type="button"
                      className="studio-existing-item"
                      onClick={() => setBlogForm(blogToForm(post))}
                    >
                      <strong>{post.title}</strong>
                      {post.pinned ? <em className="studio-pin-mark">置顶</em> : null}
                      <small>{post.slug}</small>
                    </button>
                    <Link href={`/studio/blog/${post.slug}`} className="studio-existing-link">
                      打开编辑页
                    </Link>
                  </div>
                ))}
                {!filteredBlogItems.length ? (
                  <div className="studio-empty">没有匹配的文章。</div>
                ) : null}
              </div>
              {filteredBlogItems.length ? (
                <div className="studio-pagination">
                  <button
                    type="button"
                    className="ghost-link studio-copy"
                    onClick={() => setBlogPage((prev) => Math.max(1, prev - 1))}
                    disabled={blogPage === 1}
                  >
                    上一页
                  </button>
                  <span>
                    第 {blogPage} / {blogPageCount} 页
                  </span>
                  <button
                    type="button"
                    className="ghost-link studio-copy"
                    onClick={() => setBlogPage((prev) => Math.min(blogPageCount, prev + 1))}
                    disabled={blogPage === blogPageCount}
                  >
                    下一页
                  </button>
                </div>
              ) : null}
            </div>

            <div>
              <span className="section-label">项目</span>
              <div className="studio-filter-bar">
                <label className="studio-label">
                  <span>搜索</span>
                  <input
                    value={projectSearch}
                    onChange={(event) => setProjectSearch(event.target.value)}
                    placeholder="按标题、slug、职责搜索"
                  />
                </label>
                <label className="studio-label">
                  <span>状态</span>
                  <select
                    value={projectStatusFilter}
                    onChange={(event) =>
                      setProjectStatusFilter(
                        event.target.value as "All" | "Delivered" | "In Progress",
                      )
                    }
                  >
                    <option value="All">All</option>
                    <option value="Delivered">Delivered</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </label>
                <label className="studio-label">
                  <span>排序</span>
                  <select
                    value={projectSort}
                    onChange={(event) =>
                      setProjectSort(event.target.value as "pinned" | "title" | "status")
                    }
                  >
                    <option value="pinned">置顶优先</option>
                    <option value="title">标题排序</option>
                    <option value="status">状态排序</option>
                  </select>
                </label>
              </div>
              <div className="studio-filter-meta">
                当前显示 {filteredProjectItems.length} / {projectItems.length} 个项目
              </div>
              <div className="studio-existing-list">
                {pagedProjectItems.map((project) => (
                  <div key={project.slug} className="studio-existing-card">
                    <button
                      type="button"
                      className="studio-existing-item"
                      onClick={() => setProjectForm(projectToForm(project))}
                    >
                      <strong>{project.title}</strong>
                      {project.pinned ? <em className="studio-pin-mark">置顶</em> : null}
                      <small>{project.slug}</small>
                    </button>
                    <Link href={`/studio/projects/${project.slug}`} className="studio-existing-link">
                      打开编辑页
                    </Link>
                  </div>
                ))}
                {!filteredProjectItems.length ? (
                  <div className="studio-empty">没有匹配的项目。</div>
                ) : null}
              </div>
              {filteredProjectItems.length ? (
                <div className="studio-pagination">
                  <button
                    type="button"
                    className="ghost-link studio-copy"
                    onClick={() => setProjectPage((prev) => Math.max(1, prev - 1))}
                    disabled={projectPage === 1}
                  >
                    上一页
                  </button>
                  <span>
                    第 {projectPage} / {projectPageCount} 页
                  </span>
                  <button
                    type="button"
                    className="ghost-link studio-copy"
                    onClick={() => setProjectPage((prev) => Math.min(projectPageCount, prev + 1))}
                    disabled={projectPage === projectPageCount}
                  >
                    下一页
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <div className="studio-grid">
        <section className="studio-card">
          {inBlogEditor ? (
            <div className="studio-topbar">
              <div>
                <span className="section-label">Editor Actions</span>
                <strong>当前正在编辑博客文章</strong>
              </div>
              <div className="studio-action-row">
                <Link href="/studio" className="ghost-link studio-copy">
                  返回后台
                </Link>
                {blogForm.slug ? (
                  <Link href={`/blog/${blogForm.slug}`} className="ghost-link studio-copy">
                    预览文章
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
          <span className="section-label">Blog Editor</span>
          <h2>新增 / 编辑博客文章</h2>
          <div className="studio-toolbar">
            <button
              type="button"
              className="ghost-link studio-copy"
              onClick={() => setBlogForm(initialBlog)}
            >
              新建文章
            </button>
            <Link
              href={blogForm.slug ? `/studio/blog/${blogForm.slug}` : "/studio"}
              className="ghost-link studio-copy"
            >
              独立编辑页
            </Link>
          </div>
          <div className="studio-form">
            <label className="studio-label">
              <span>标题</span>
              <input
                value={blogForm.title}
                onChange={(event) => setBlogForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </label>
            <label className="studio-label">
              <span>Slug</span>
              <input
                value={blogForm.slug}
                onChange={(event) => setBlogForm((prev) => ({ ...prev, slug: event.target.value }))}
                placeholder="建议英文，如 ai-practice-note"
              />
            </label>
            <label className="studio-label">
              <span>分类</span>
              <input
                value={blogForm.category}
                onChange={(event) =>
                  setBlogForm((prev) => ({ ...prev, category: event.target.value }))
                }
              />
            </label>
            <label className="studio-label">
              <span>摘要</span>
              <textarea
                rows={3}
                value={blogForm.summary}
                onChange={(event) =>
                  setBlogForm((prev) => ({ ...prev, summary: event.target.value }))
                }
              />
            </label>
            <div className="studio-inline">
              <label className="studio-label studio-check">
                <span>置顶</span>
                <input
                  type="checkbox"
                  checked={blogForm.pinned}
                  onChange={(event) =>
                    setBlogForm((prev) => ({ ...prev, pinned: event.target.checked }))
                  }
                />
              </label>
              <label className="studio-label">
                <span>状态</span>
                <select
                  value={blogForm.status}
                  onChange={(event) =>
                    setBlogForm((prev) => ({ ...prev, status: event.target.value }))
                  }
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                </select>
              </label>
              <label className="studio-label">
                <span>阅读时长</span>
                <input
                  value={blogForm.readingTime}
                  onChange={(event) =>
                    setBlogForm((prev) => ({ ...prev, readingTime: event.target.value }))
                  }
                />
              </label>
            </div>
            <label className="studio-label">
              <span>标签</span>
              <input
                value={blogForm.tags}
                onChange={(event) => setBlogForm((prev) => ({ ...prev, tags: event.target.value }))}
                placeholder="用逗号分隔，如 AI, Ops, RAG"
              />
            </label>
            <label className="studio-label">
              <span>封面图 URL</span>
              <input
                value={blogForm.coverImage}
                onChange={(event) =>
                  setBlogForm((prev) => ({ ...prev, coverImage: event.target.value }))
                }
                placeholder="/media/xxx.png 或外部图片地址"
              />
            </label>
            {blogForm.coverImage ? (
              <div className="studio-cover-preview">
                <img src={blogForm.coverImage} alt={blogForm.title || "Blog cover"} />
              </div>
            ) : null}
            {blogForm.coverImage ? (
              <div className="studio-action-row">
                <button
                  type="button"
                  className="ghost-link studio-copy"
                  onClick={() => setBlogForm((prev) => ({ ...prev, coverImage: "" }))}
                >
                  清空封面
                </button>
              </div>
            ) : null}
            <label className="studio-label">
              <span>发布日期</span>
              <input
                type="date"
                value={blogForm.publishedAt}
                onChange={(event) =>
                  setBlogForm((prev) => ({ ...prev, publishedAt: event.target.value }))
                }
              />
            </label>
            <label className="studio-label">
              <span>正文 Markdown</span>
              <textarea
                ref={blogContentRef}
                rows={14}
                value={blogForm.content}
                onChange={(event) => setBlogForm((prev) => ({ ...prev, content: event.target.value }))}
              />
            </label>
            <div className="studio-action-row">
              <button
                type="button"
                className="primary-link studio-submit"
                onClick={submitBlog}
                disabled={pending === "blog" || (!authenticated && !token)}
              >
                {pending === "blog" ? "保存中..." : "保存文章"}
              </button>
              {blogForm.slug ? (
                <button
                  type="button"
                  className="studio-danger"
                  onClick={deleteBlog}
                  disabled={pending === "blog" || (!authenticated && !token)}
                >
                  删除文章
                </button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="studio-card">
          {inProjectEditor ? (
            <div className="studio-topbar">
              <div>
                <span className="section-label">Editor Actions</span>
                <strong>当前正在编辑项目案例</strong>
              </div>
              <div className="studio-action-row">
                <Link href="/studio" className="ghost-link studio-copy">
                  返回后台
                </Link>
                {projectForm.slug ? (
                  <Link href={`/projects/${projectForm.slug}`} className="ghost-link studio-copy">
                    预览项目
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
          <span className="section-label">Project Editor</span>
          <h2>新增 / 编辑项目案例</h2>
          <div className="studio-toolbar">
            <button
              type="button"
              className="ghost-link studio-copy"
              onClick={() => setProjectForm(initialProject)}
            >
              新建项目
            </button>
            <Link
              href={projectForm.slug ? `/studio/projects/${projectForm.slug}` : "/studio"}
              className="ghost-link studio-copy"
            >
              独立编辑页
            </Link>
          </div>
          <div className="studio-form">
            <label className="studio-label">
              <span>标题</span>
              <input
                value={projectForm.title}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />
            </label>
            <label className="studio-label">
              <span>Slug</span>
              <input
                value={projectForm.slug}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, slug: event.target.value }))
                }
                placeholder="建议英文，如 migration-case"
              />
            </label>
            <label className="studio-label">
              <span>摘要</span>
              <textarea
                rows={3}
                value={projectForm.summary}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, summary: event.target.value }))
                }
              />
            </label>
            <div className="studio-inline">
              <label className="studio-label studio-check">
                <span>置顶</span>
                <input
                  type="checkbox"
                  checked={projectForm.pinned}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, pinned: event.target.checked }))
                  }
                />
              </label>
              <label className="studio-label">
                <span>状态</span>
                <select
                  value={projectForm.status}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, status: event.target.value }))
                  }
                >
                  <option value="Delivered">Delivered</option>
                  <option value="In Progress">In Progress</option>
                </select>
              </label>
              <label className="studio-label">
                <span>角色</span>
                <input
                  value={projectForm.role}
                  onChange={(event) =>
                    setProjectForm((prev) => ({ ...prev, role: event.target.value }))
                  }
                />
              </label>
            </div>
            <label className="studio-label">
              <span>技术栈</span>
              <input
                value={projectForm.stack}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, stack: event.target.value }))
                }
                placeholder="用逗号分隔，如 Kubernetes, Docker, Go"
              />
            </label>
            <label className="studio-label">
              <span>结果</span>
              <input
                value={projectForm.outcome}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, outcome: event.target.value }))
                }
              />
            </label>
            <label className="studio-label">
              <span>封面图 URL</span>
              <input
                value={projectForm.coverImage}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, coverImage: event.target.value }))
                }
                placeholder="/media/xxx.png 或外部图片地址"
              />
            </label>
            {projectForm.coverImage ? (
              <div className="studio-cover-preview">
                <img src={projectForm.coverImage} alt={projectForm.title || "Project cover"} />
              </div>
            ) : null}
            {projectForm.coverImage ? (
              <div className="studio-action-row">
                <button
                  type="button"
                  className="ghost-link studio-copy"
                  onClick={() => setProjectForm((prev) => ({ ...prev, coverImage: "" }))}
                >
                  清空封面
                </button>
              </div>
            ) : null}
            <label className="studio-label">
              <span>正文 Markdown</span>
              <textarea
                ref={projectContentRef}
                rows={14}
                value={projectForm.content}
                onChange={(event) =>
                  setProjectForm((prev) => ({ ...prev, content: event.target.value }))
                }
              />
            </label>
            <div className="studio-action-row">
              <button
                type="button"
                className="primary-link studio-submit"
                onClick={submitProject}
                disabled={pending === "project" || (!authenticated && !token)}
              >
                {pending === "project" ? "保存中..." : "保存项目"}
              </button>
              {projectForm.slug ? (
                <button
                  type="button"
                  className="studio-danger"
                  onClick={deleteProjectItem}
                  disabled={pending === "project" || (!authenticated && !token)}
                >
                  删除项目
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <div className="studio-grid">
        <section className="studio-card">
          <span className="section-label">Current Blog Titles</span>
          <ul className="studio-list">
            {sortBlogLikeItems(blogItems).map((item) => (
              <li key={item.slug}>{item.title}</li>
            ))}
          </ul>
        </section>
        <section className="studio-card">
          <span className="section-label">Current Project Titles</span>
          <ul className="studio-list">
            {sortProjectLikeItems(projectItems).map((item) => (
              <li key={item.slug}>{item.title}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
