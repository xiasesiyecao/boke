import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isAdminSessionActive } from "../../../lib/admin";
import { getProject } from "../../../lib/projects";

type ProjectPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProject(params.slug);

  if (!project) {
    return {
      title: "项目不存在 | 王普霖",
    };
  }

  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProject(params.slug);
  const isAdmin = isAdminSessionActive();

  if (!project) {
    notFound();
  }

  return (
    <main className="post-shell">
      <div className="post-back">
        <Link href="/projects">返回项目列表</Link>
        {isAdmin ? (
          <Link href={`/studio/projects/${project.slug}`} className="post-edit-link">
            编辑这个项目
          </Link>
        ) : null}
      </div>

      <article className="post-card">
        <header className="post-header">
          {project.coverImage ? (
            <div className="post-cover">
              <img src={project.coverImage} alt={project.title} />
            </div>
          ) : null}
          <div className="article-meta">
            <span>{project.status}</span>
            <span>{project.role}</span>
          </div>
          <h1>{project.title}</h1>
          <p>{project.summary}</p>
          <div className="post-tags">
            <span>{project.outcome}</span>
            <span>{project.stack.join(" / ")}</span>
          </div>
        </header>

        <div className="post-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{project.content}</ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
