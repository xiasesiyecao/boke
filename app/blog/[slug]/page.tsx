import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isAdminSessionActive } from "../../../lib/admin";
import { getBlogPost } from "../../../lib/blog";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPost(params.slug);

  if (!post) {
    return {
      title: "文章不存在 | 王普霖",
    };
  }

  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.slug);
  const isAdmin = isAdminSessionActive();

  if (!post) {
    notFound();
  }

  return (
    <main className="post-shell">
      <div className="post-back">
        <Link href="/blog">返回文章列表</Link>
        {isAdmin ? (
          <Link href={`/studio/blog/${post.slug}`} className="post-edit-link">
            编辑这篇文章
          </Link>
        ) : null}
      </div>

      <article className="post-card">
        <header className="post-header">
          {post.coverImage ? (
            <div className="post-cover">
              <img src={post.coverImage} alt={post.title} />
            </div>
          ) : null}
          <div className="article-meta">
            <span>{post.category}</span>
            <span>{post.status}</span>
          </div>
          <h1>{post.title}</h1>
          <p>{post.summary}</p>
          <div className="post-tags">
            <span>{post.readingTime}</span>
            <span>{post.tags.join(" / ")}</span>
          </div>
        </header>

        <div className="post-prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
