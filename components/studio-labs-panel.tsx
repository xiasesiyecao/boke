"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { sortProjectLikeItems } from "../lib/content-sort";
import type { Lab, LabModule, LabStatus } from "../lib/labs";

type StudioLabsPanelProps = {
  labs: Lab[];
  initialAuthenticated: boolean;
  initialLabSlug?: string;
};

const initialLab = {
  originalSlug: "",
  title: "",
  slug: "",
  module: "Idea Experiments" as LabModule,
  summary: "",
  pinned: false,
  status: "Open" as LabStatus,
  tags: "",
  coverImage: "",
  content: "",
};

function splitCommaValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function labToForm(lab: Lab) {
  return {
    originalSlug: lab.slug,
    title: lab.title,
    slug: lab.slug,
    module: lab.module,
    summary: lab.summary,
    pinned: lab.pinned,
    status: lab.status,
    tags: lab.tags.join(", "),
    coverImage: lab.coverImage || "",
    content: lab.content,
  };
}

export function StudioLabsPanel({
  labs,
  initialAuthenticated,
  initialLabSlug,
}: StudioLabsPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState("");
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [items, setItems] = useState(labs);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState<"All" | LabModule>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | LabStatus>("All");
  const [form, setForm] = useState(() => {
    const selected = initialLabSlug ? labs.find((item) => item.slug === initialLabSlug) : null;
    return selected ? labToForm(selected) : initialLab;
  });
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"info" | "success" | "error">("info");
  const [pending, setPending] = useState<"save" | "delete" | "session" | null>(null);

  function setFeedback(nextMessage: string, tone: "info" | "success" | "error" = "info") {
    setMessage(nextMessage);
    setMessageTone(tone);
  }

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

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        item.module.toLowerCase().includes(query);
      const matchesModule = moduleFilter === "All" || item.module === moduleFilter;
      const matchesStatus = statusFilter === "All" || item.status === statusFilter;

      return matchesQuery && matchesModule && matchesStatus;
    });

    return sortProjectLikeItems(filtered);
  }, [items, moduleFilter, search, statusFilter]);

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

  async function saveItem() {
    setPending("save");
    setFeedback("", "info");

    const response = await fetch("/api/admin/labs", {
      method: "POST",
      credentials: "same-origin",
      headers: buildAdminHeaders(true),
      body: JSON.stringify({
        ...form,
        tags: splitCommaValues(form.tags),
      }),
    });

    const result = await readJsonSafe(response);
    setPending(null);
    setFeedback(String(result.message || "Saved."), response.ok ? "success" : "error");

    if (response.ok) {
      const savedSlug = String(result.slug || form.slug);
      const savedItem = {
        slug: savedSlug,
        title: form.title,
        module: form.module,
        summary: form.summary,
        pinned: form.pinned,
        status: form.status,
        tags: splitCommaValues(form.tags),
        coverImage: form.coverImage || undefined,
        content: form.content,
      } satisfies Lab;

      setItems((prev) => {
        const next = prev.filter(
          (item) => item.slug !== savedSlug && item.slug !== form.originalSlug,
        );
        return sortProjectLikeItems([...next, savedItem]);
      });
      setForm((prev) => ({
        ...prev,
        originalSlug: savedSlug,
        slug: savedSlug,
      }));

      if (pathname.startsWith("/studio/labs/") && pathname !== `/studio/labs/${savedSlug}`) {
        router.replace(`/studio/labs/${savedSlug}`);
      }
    }
  }

  async function deleteItem() {
    if (!form.slug || !confirm(`确认删除 Labs 条目 "${form.title}" 吗？`)) {
      return;
    }

    setPending("delete");
    setFeedback("", "info");

    const response = await fetch("/api/admin/labs", {
      method: "DELETE",
      credentials: "same-origin",
      headers: buildAdminHeaders(true),
      body: JSON.stringify({ slug: form.originalSlug || form.slug }),
    });

    const result = await readJsonSafe(response);
    setPending(null);
    setFeedback(String(result.message || "Deleted."), response.ok ? "success" : "error");

    if (response.ok) {
      const targetSlug = form.originalSlug || form.slug;
      setItems((prev) => prev.filter((item) => item.slug !== targetSlug));
      setForm(initialLab);
      if (pathname.startsWith("/studio/labs/")) {
        router.replace("/studio/labs");
      }
    }
  }

  return (
    <div className="studio-shell">
      <section className="studio-card">
        <span className="section-label">Labs Studio</span>
        <h2>Labs 后台管理</h2>
        <p>这里用于维护实验模块条目，适合承接游戏开发、运维脚本和实验想法等探索性内容。</p>
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
        ) : null}
        {message ? (
          <div className={`studio-message studio-message-${messageTone}`}>{message}</div>
        ) : null}
      </section>

      <div className="studio-grid">
        <section className="studio-card">
          <span className="section-label">Manage Labs</span>
          <h2>管理现有 Labs 条目</h2>
          <div className="studio-filter-bar">
            <label className="studio-label">
              <span>搜索</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="按标题、slug、模块搜索"
              />
            </label>
            <label className="studio-label">
              <span>模块</span>
              <select
                value={moduleFilter}
                onChange={(event) =>
                  setModuleFilter(event.target.value as "All" | LabModule)
                }
              >
                <option value="All">All</option>
                <option value="Game Dev">Game Dev</option>
                <option value="Ops Scripts">Ops Scripts</option>
                <option value="Idea Experiments">Idea Experiments</option>
                <option value="Backlog">Backlog</option>
              </select>
            </label>
            <label className="studio-label">
              <span>状态</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as "All" | LabStatus)
                }
              >
                <option value="All">All</option>
                <option value="Planned">Planned</option>
                <option value="Active">Active</option>
                <option value="Open">Open</option>
                <option value="Reserved">Reserved</option>
              </select>
            </label>
          </div>
          <div className="studio-filter-meta">
            当前显示 {filteredItems.length} / {items.length} 个 Labs 条目
          </div>
          <div className="studio-existing-list">
            {filteredItems.map((item) => (
              <div key={item.slug} className="studio-existing-card">
                <button
                  type="button"
                  className="studio-existing-item"
                  onClick={() => setForm(labToForm(item))}
                >
                  <strong>{item.title}</strong>
                  {item.pinned ? <em className="studio-pin-mark">置顶</em> : null}
                  <small>{item.slug}</small>
                </button>
                <Link href={`/studio/labs/${item.slug}`} className="studio-existing-link">
                  打开编辑页
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="studio-card">
          <div className="studio-topbar">
            <div>
              <span className="section-label">Labs Editor</span>
              <strong>新增 / 编辑 Labs 条目</strong>
            </div>
            <div className="studio-action-row">
              <button
                type="button"
                className="ghost-link studio-copy"
                onClick={() => setForm(initialLab)}
              >
                新建条目
              </button>
              <Link href="/studio" className="ghost-link studio-copy">
                返回主后台
              </Link>
              {form.slug ? (
                <Link href={`/labs/${form.slug}`} className="ghost-link studio-copy">
                  预览条目
                </Link>
              ) : null}
            </div>
          </div>

          <div className="studio-form">
            <label className="studio-label">
              <span>标题</span>
              <input
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              />
            </label>
            <label className="studio-label">
              <span>Slug</span>
              <input
                value={form.slug}
                onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              />
            </label>
            <div className="studio-inline">
              <label className="studio-label">
                <span>模块</span>
                <select
                  value={form.module}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, module: event.target.value as LabModule }))
                  }
                >
                  <option value="Game Dev">Game Dev</option>
                  <option value="Ops Scripts">Ops Scripts</option>
                  <option value="Idea Experiments">Idea Experiments</option>
                  <option value="Backlog">Backlog</option>
                </select>
              </label>
              <label className="studio-label studio-check">
                <span>置顶</span>
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, pinned: event.target.checked }))
                  }
                />
              </label>
              <label className="studio-label">
                <span>状态</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, status: event.target.value as LabStatus }))
                  }
                >
                  <option value="Planned">Planned</option>
                  <option value="Active">Active</option>
                  <option value="Open">Open</option>
                  <option value="Reserved">Reserved</option>
                </select>
              </label>
            </div>
            <label className="studio-label">
              <span>摘要</span>
              <textarea
                rows={3}
                value={form.summary}
                onChange={(event) => setForm((prev) => ({ ...prev, summary: event.target.value }))}
              />
            </label>
            <label className="studio-label">
              <span>标签</span>
              <input
                value={form.tags}
                onChange={(event) => setForm((prev) => ({ ...prev, tags: event.target.value }))}
                placeholder="用逗号分隔"
              />
            </label>
            <label className="studio-label">
              <span>封面图 URL</span>
              <input
                value={form.coverImage}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, coverImage: event.target.value }))
                }
                placeholder="/media/xxx.png 或外部图片地址"
              />
            </label>
            <label className="studio-label">
              <span>正文 Markdown</span>
              <textarea
                rows={14}
                value={form.content}
                onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
              />
            </label>

            <div className="studio-action-row">
              <button
                type="button"
                className="primary-link studio-submit"
                onClick={saveItem}
                disabled={pending === "save" || (!authenticated && !token)}
              >
                {pending === "save" ? "保存中..." : "保存 Labs 条目"}
              </button>
              {form.slug ? (
                <button
                  type="button"
                  className="studio-danger"
                  onClick={deleteItem}
                  disabled={pending === "delete" || (!authenticated && !token)}
                >
                  删除条目
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
