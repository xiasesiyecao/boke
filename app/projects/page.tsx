import Link from "next/link";
import { CardCover } from "../../components/card-cover";
import { HeroVisual } from "../../components/hero-visual";
import { getAllProjects } from "../../lib/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsIndexPage() {
  const projects = await getAllProjects();

  return (
    <main className="blog-shell">
      <section className="blog-hero">
        <div className="page-hero-layout">
          <div>
            <span className="section-label">Project Index</span>
            <h1>项目展示聚焦真实交付，而不是概念包装。</h1>
            <p>
              这里集中展示虚拟化迁移、交付体系建设和 AI 产品工程化落地相关的项目实践。
            </p>
            <div className="hero-meta-row">
              <div className="hero-meta-card">
                <span>Total Projects</span>
                <strong>{projects.length}</strong>
              </div>
              <div className="hero-meta-card">
                <span>Primary Lens</span>
                <strong>Delivery & Stability</strong>
              </div>
              <div className="hero-meta-card">
                <span>Style</span>
                <strong>Engineering First</strong>
              </div>
            </div>
          </div>

          <HeroVisual
            eyebrow="Project Surface"
            title="Delivery Cases"
            detail="项目页更强调职责、交付路径和结果，而不是只展示技术名词。"
            rows={[
              { label: "Infra", value: "VMware to PVE" },
              { label: "Product", value: "AIGC Delivery" },
              { label: "Focus", value: "Stability + Cost" },
            ]}
            chips={["Migration", "Packaging", "Upgrade", "Governance"]}
          />
        </div>
      </section>

      <section className="blog-grid">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="blog-card"
          >
            <CardCover
              variant="project"
              accent={project.outcome}
              tags={project.stack.slice(0, 3)}
              imageUrl={project.coverImage}
            />
            <div className="article-meta">
              <span>{project.status}</span>
              <span>{project.role}</span>
            </div>
            <h2>{project.title}</h2>
            <p>{project.summary}</p>
            <div className="blog-card-footer">
              <span>{project.outcome}</span>
              <span>{project.stack.join(" / ")}</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
