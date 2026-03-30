import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isAdminSessionActive } from "../../../lib/admin";
import { getLab } from "../../../lib/labs";

type LabPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: LabPageProps): Promise<Metadata> {
  const lab = await getLab(params.slug);

  if (!lab) {
    return {
      title: "实验内容不存在 | 王普霖",
    };
  }

  return {
    title: lab.title,
    description: lab.summary,
  };
}

export default async function LabDetailPage({ params }: LabPageProps) {
  const lab = await getLab(params.slug);
  const isAdmin = isAdminSessionActive();

  if (!lab) {
    notFound();
  }

  return (
    <main className="post-shell">
      <div className="post-back">
        <Link href="/labs">返回 Labs</Link>
        {isAdmin ? (
          <Link href={`/studio/labs/${lab.slug}`} className="post-edit-link">
            编辑这个模块
          </Link>
        ) : null}
      </div>

      <article className="post-card">
        <header className="post-header">
          {lab.coverImage ? (
            <div className="post-cover">
              <img src={lab.coverImage} alt={lab.title} />
            </div>
          ) : null}
          <div className="article-meta">
            <span>{lab.module}</span>
            <span>{lab.status}</span>
          </div>
          <h1>{lab.title}</h1>
          <p>{lab.summary}</p>
          <div className="post-tags">
            <span>Lab Track</span>
            <span>{lab.tags.join(" / ")}</span>
          </div>
        </header>

        <div className="post-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{lab.content}</ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
