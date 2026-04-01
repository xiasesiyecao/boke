import Link from "next/link";
import { CardCover } from "../components/card-cover";
import { HeroVisual } from "../components/hero-visual";
import { getAllBlogPosts } from "../lib/blog";
import { getAllProjects } from "../lib/projects";

const statusCards = [
  { label: "Experience", value: "5 Years", meta: "Infrastructure and delivery engineering" },
  { label: "Current Focus", value: "AI Practice", meta: "Applied solutions and product landing" },
  { label: "Core Stack", value: "CI/CD + K8S", meta: "Delivery pipeline and platform stability" },
  { label: "Base", value: "Beijing", meta: "Platform engineering and AI integration" },
];

const capabilities = [
  "CI/CD",
  "AIGC",
  "Kubernetes",
  "PVE",
  "Automation",
  "Platform Delivery",
];

const operatingNotes = [
  "把复杂系统做成稳定交付",
  "关注 AI 在企业环境中的可落地性",
  "优先真实价值，而不是概念包装",
];

export const dynamic = "force-dynamic";

export default async function Home() {
  const [projects, blogPosts] = await Promise.all([getAllProjects(), getAllBlogPosts()]);
  const signalTape = [
    { label: "Projects", value: `${projects.length}`, meta: "真实交付案例" },
    { label: "Articles", value: `${blogPosts.length}`, meta: "AI 应用技术文章" },
    { label: "Motto", value: "知行合一", meta: "工程优先，结果导向" },
    { label: "GitHub", value: "xiasesiyecao", meta: "公开沉淀与持续输出" },
  ];

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            WANG PULIN / CLOVER
          </div>
          <p className="kicker">知行合一</p>
          <h1>
            运维开发工程师，专注 CI/CD、Kubernetes、虚拟化平台与 AI 应用落地。
          </h1>
          <p className="summary">
            5 年运维开发经验，长期关注自动化交付、基础设施演进与 AI 实践，致力于把复杂技术转化为稳定、可落地的工程方案。这里会持续记录项目实践、架构思路和 AI 应用技术文章。
          </p>

          <div className="hero-actions">
            <a href="#projects" className="primary-link">
              查看项目
            </a>
            <Link href="/blog" className="ghost-link">
              阅读博客
            </Link>
          </div>

          <div className="signal-row">
            <div>
              <span className="signal-label">Current Focus</span>
              <strong>AI 实践与可落地方案项目</strong>
            </div>
            <div>
              <span className="signal-label">Contact</span>
              <strong>19327492161@163.com</strong>
            </div>
          </div>
        </div>

        <aside className="hero-panel">
          <div className="panel-header">
            <div>
              <span className="panel-label">Realtime Status Panel</span>
              <h2>Operator Signal Board</h2>
            </div>
            <span className="panel-badge">ACTIVE</span>
          </div>

          <HeroVisual
            eyebrow="Signal Mesh"
            title="Infra / AI / Delivery"
            detail="以基础设施稳定性为底座，把交付链路和 AI 实践组织成可复用工程能力。"
            rows={[
              { label: "Ops Core", value: "CI/CD + K8S" },
              { label: "Infra Track", value: "PVE Migration" },
              { label: "AI Track", value: "AIGC Delivery" },
            ]}
            chips={["Automation", "Reliability", "Delivery", "AI Practice"]}
          />

          <div className="panel-grid">
            {statusCards.map((card) => (
              <article key={card.label} className="status-card">
                <span className="status-label">{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.meta}</small>
              </article>
            ))}
          </div>

          <div className="panel-rail">
            <div className="rail-line" />
            <div className="rail-block">
              <span>GitHub</span>
              <strong>github.com/xiasesiyecao</strong>
            </div>
            <div className="rail-block">
              <span>Personal Motto</span>
              <strong>知行合一</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="signal-tape">
        <div className="signal-tape-grid">
          {signalTape.map((item) => (
            <article key={item.label} className="signal-tape-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.meta}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="section summary-band">
        <div className="section-heading">
          <span className="section-label">Operating Notes</span>
          <h2>这个站的核心不是展示自己，而是展示我如何做事。</h2>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-card-label">How I Work</span>
            <p>
              从基础设施到 AI 产品交付，我更重视方案是否能稳定运行、是否方便团队维护、是否能够持续复用，而不是只做一次性的漂亮结果。
            </p>
          </div>

          <div className="summary-points">
            {operatingNotes.map((item) => (
              <div key={item} className="summary-point">
                <span className="summary-point-mark" />
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="projects">
        <div className="section-heading">
          <span className="section-label">Selected Projects</span>
          <h2>项目展示强调真实场景，而不是概念拼贴。</h2>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <Link
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="project-card project-link"
            >
              <CardCover
                variant="project"
                accent={project.outcome}
                tags={project.stack.slice(0, 3)}
                imageUrl={project.coverImage}
              />
              <div className="card-topline">
                <span className="mono-label">PROJECT</span>
                <span className="card-metric">{project.outcome}</span>
              </div>
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
              <div className="card-footer">{project.stack.join(" / ")}</div>
            </Link>
          ))}
        </div>
        <div className="section-cta">
          <Link href="/projects" className="ghost-link">
            查看全部项目
          </Link>
        </div>
      </section>

      <section className="section" id="articles">
        <div className="section-heading">
          <span className="section-label">AI Notes</span>
          <h2>博客主线聚焦 AI 在运维与平台工程中的应用技术。</h2>
        </div>

        <div className="article-list">
          {blogPosts.slice(0, 2).map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="article-card article-link">
              <CardCover
                variant="article"
                accent={article.category}
                tags={article.tags.slice(0, 3)}
                imageUrl={article.coverImage}
              />
              <div className="article-meta">
                <span>{article.category}</span>
                <span>{article.status}</span>
              </div>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
            </Link>
          ))}
        </div>
        <div className="section-cta">
          <Link href="/blog" className="ghost-link">
            查看全部文章
          </Link>
        </div>
      </section>

      <section className="section labs-band">
        <div className="section-heading">
          <span className="section-label">Labs</span>
          <h2>前端游戏、交互实验和轻量原型，会先在这里公开迭代。</h2>
        </div>

        <div className="labs-band-panel">
          <div>
            <p className="labs-band-copy">
              Labs 是这个站点里更轻、更快的一层。相比正式项目，它更适合承接浏览器小游戏、玩法验证、界面实验、AI 协作页面和小型工具。
            </p>
            <div className="hero-actions">
              <Link href="/labs" className="primary-link">
                进入 Labs
              </Link>
              <Link href="/projects" className="ghost-link">
                查看正式项目
              </Link>
            </div>
          </div>

          <div className="labs-band-grid">
            <article className="labs-band-card">
              <span>Track</span>
              <strong>Frontend Games</strong>
              <small>玩法原型、交互反馈、节奏和可玩性验证</small>
            </article>
            <article className="labs-band-card">
              <span>Track</span>
              <strong>Interaction Concepts</strong>
              <small>动态界面、信息表达和视觉实验</small>
            </article>
            <article className="labs-band-card">
              <span>Track</span>
              <strong>Tooling</strong>
              <small>开发辅助面板、脚本和 AI 协作页面</small>
            </article>
          </div>
        </div>
      </section>

      <section className="capability-band">
        <div className="section-heading compact">
          <span className="section-label">Capability Matrix</span>
          <h2>让技术栈表达能力编排，而不是工具名堆积。</h2>
        </div>

        <div className="capability-grid">
          {capabilities.map((item) => (
            <div key={item} className="capability-chip">
              {item}
            </div>
          ))}
        </div>
      </section>

      <footer className="footer">
        <div>
          <span className="section-label">Contact</span>
          <p>
            <a href="mailto:19327492161@163.com">19327492161@163.com</a>
            {" / "}
            <a href="https://github.com/xiasesiyecao" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </p>
        </div>
        <div className="footer-links">
          <Link href="/projects">Projects</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/labs">Labs</Link>
          <Link href="/about">About</Link>
        </div>
        <div className="footer-note">
          Clover / Beijing / Infrastructure, delivery, and AI application practice.
        </div>
      </footer>
    </main>
  );
}
