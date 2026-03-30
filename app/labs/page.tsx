import Link from "next/link";
import { HeroVisual } from "../../components/hero-visual";
import { getAllLabs } from "../../lib/labs";

const notes = [
  "Labs 用来容纳探索性内容，不和主线项目、博客抢定位。",
  "这里允许更快试错，但仍然保持工程表达，而不是只堆概念。",
  "游戏开发会作为长期实验方向逐步沉淀，先从模块和想法收纳开始。",
];

const pendingQueue = [
  "游戏玩法原型与数值循环实验",
  "运维辅助脚本的小型工具集合",
  "AI 工作流与 Agent 协作的验证页面",
  "尚未成型但值得保留的 side project 想法",
];

export const dynamic = "force-dynamic";

export default async function LabsPage() {
  const labTracks = await getAllLabs();

  return (
    <main className="about-shell">
      <section className="about-hero">
        <div className="page-hero-layout">
          <div>
            <span className="section-label">Labs</span>
            <h1>实验、原型、想法验证，都放在这里。</h1>
            <p>
              Labs 不和主线项目、博客竞争定位，它更像一个技术实验场，用来承接游戏开发、AI 原型和基础设施小工具等探索性内容。
            </p>
            <div className="hero-meta-row">
              <div className="hero-meta-card">
                <span>Tracks</span>
                <strong>4</strong>
              </div>
              <div className="hero-meta-card">
                <span>Style</span>
                <strong>Prototype First</strong>
              </div>
              <div className="hero-meta-card">
                <span>Goal</span>
                <strong>From Idea To Signal</strong>
              </div>
            </div>
          </div>

          <HeroVisual
            eyebrow="Labs Surface"
            title="Explore / Prototype / Iterate"
            detail="把不适合直接归类到项目或博客主线的内容，统一收纳到实验室栏目。"
            rows={[
              { label: "Track A", value: "Game Dev" },
              { label: "Track B", value: "Ops Scripts" },
              { label: "Track C", value: "Idea Experiments" },
            ]}
            chips={["Prototype", "Gameplay", "Agent", "Tooling"]}
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
              <span>{track.module}</span>
              <span>{track.tags.join(" / ")}</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="about-card">
        <span className="section-label">Why Labs</span>
        <h2>这个栏目解决的是“探索内容放哪里”的问题。</h2>
        <div className="timeline">
          {notes.map((note) => (
            <article key={note} className="timeline-item">
              <p>{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-card">
        <span className="section-label">Backlog</span>
        <h2>Labs 里会优先落地这些内容方向。</h2>
        <div className="timeline">
          {pendingQueue.map((item) => (
            <article key={item} className="timeline-item">
              <p>{item}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-card">
        <span className="section-label">Navigation</span>
        <h2>你可以把 Labs 理解成一个过渡层。</h2>
        <p className="about-quote">
          当某个实验足够成熟，它可以进一步进入正式的项目页或技术博客；在此之前，Labs
          允许它以更轻、更快的方式存在。
        </p>
        <div className="section-cta">
          <Link href="/projects" className="ghost-link">
            查看主线项目
          </Link>
        </div>
      </section>
    </main>
  );
}
