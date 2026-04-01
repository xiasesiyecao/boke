import Link from "next/link";
import { HeroVisual } from "../../components/hero-visual";
import { getAllLabs, getLabModuleDisplayName } from "../../lib/labs";

export const dynamic = "force-dynamic";

export default async function LabsPage() {
  const labTracks = await getAllLabs();
  const activeCount = labTracks.filter((item) => item.status === "Active").length;
  const plannedCount = labTracks.filter((item) => item.status === "Planned").length;

  return (
    <main className="about-shell">
      <section className="about-hero labs-hero">
        <div className="page-hero-layout">
          <div>
            <span className="section-label">Labs</span>
            <h1>面向公开展示的实验场，优先承接前端游戏与交互原型。</h1>
            <p>
              这里收纳的是还在探索阶段、但已经值得被看见的内容。后续的前端小游戏、玩法验证、交互实验和轻量工具，会优先在 Labs 里公开迭代。
            </p>
            <div className="hero-meta-row">
              <div className="hero-meta-card">
                <span>Tracks</span>
                <strong>{labTracks.length}</strong>
              </div>
              <div className="hero-meta-card">
                <span>Active</span>
                <strong>{activeCount}</strong>
              </div>
              <div className="hero-meta-card">
                <span>Planned</span>
                <strong>{plannedCount}</strong>
              </div>
            </div>
          </div>

          <HeroVisual
            eyebrow="Playable Surface"
            title="Build / Test / Ship"
            detail="把游戏原型、界面实验和小型工具作为可浏览、可持续更新的公开栏目来维护。"
            rows={[
              { label: "Primary Track", value: "Frontend Games" },
              { label: "Secondary", value: "Interaction Concepts" },
              { label: "Support", value: "Tooling + AI Experiments" },
            ]}
            chips={["Playable", "Browser", "Prototype", "Tooling"]}
          />
        </div>
      </section>

      <section className="blog-grid">
        {labTracks.map((track) => (
          <Link key={track.slug} href={`/labs/${track.slug}`} className="blog-card">
            <div className="article-meta">
              <span>Lab Track</span>
              <span>{track.status}</span>
            </div>
            <h2>{track.title}</h2>
            <p>{track.summary}</p>
            <div className="blog-card-footer">
              <span>{getLabModuleDisplayName(track.module)}</span>
              <span>{track.tags.join(" / ")}</span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
