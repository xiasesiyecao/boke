import Link from "next/link";
import { CardCover } from "../../components/card-cover";
import { HeroVisual } from "../../components/hero-visual";
import { getAllBlogPosts } from "../../lib/blog";

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const blogPosts = await getAllBlogPosts();

  return (
    <main className="blog-shell">
      <section className="blog-hero">
        <div className="page-hero-layout">
          <div>
            <span className="section-label">Blog Index</span>
            <h1>AI 应用、运维工程与平台实践文章。</h1>
            <p>
              这里会持续整理 AI 工具实践、AIGC 产品落地、自动化运维与基础设施演进相关的技术文章。
            </p>
            <div className="hero-meta-row">
              <div className="hero-meta-card">
                <span>Total Posts</span>
                <strong>{blogPosts.length}</strong>
              </div>
              <div className="hero-meta-card">
                <span>Focus</span>
                <strong>AI Practice / Ops</strong>
              </div>
              <div className="hero-meta-card">
                <span>Status</span>
                <strong>Continuous Writing</strong>
              </div>
            </div>
          </div>

          <HeroVisual
            eyebrow="Writing Signal"
            title="Applied AI Notes"
            detail="文章会优先落在实践、工程化和可落地性，而不是单纯追热点。"
            rows={[
              { label: "Track", value: "AI Tooling" },
              { label: "Field", value: "Ops Engineering" },
              { label: "Method", value: "From Concept To Delivery" },
            ]}
            chips={["Codex", "AIGC", "RAG", "Automation"]}
          />
        </div>
      </section>

      <section className="blog-grid">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
            <CardCover
              variant="article"
              accent={post.category}
              tags={post.tags.slice(0, 3)}
              imageUrl={post.coverImage}
            />
            <div className="article-meta">
              <span>{post.category}</span>
              <span>{post.status}</span>
            </div>
            <h2>{post.title}</h2>
            <p>{post.summary}</p>
            <div className="blog-card-footer">
              <span>{post.readingTime}</span>
              <span>{post.tags.join(" / ")}</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
