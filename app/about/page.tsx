import { HeroVisual } from "../../components/hero-visual";

const strengths = [
  "CI/CD 交付链路设计与优化",
  "Kubernetes 平台与容器化交付",
  "PVE / 虚拟化平台迁移与治理",
  "AIGC 产品工程化落地",
  "自动化运维与脚本工具建设",
  "跨团队项目推进与实施统筹",
];

const timeline = [
  {
    title: "运维开发工程师 / 5年经验",
    summary:
      "长期围绕基础设施、自动化交付和平台稳定性开展工程实践，关注技术方案的可维护性与业务价值。",
  },
  {
    title: "虚拟化平台迁移实践",
    summary:
      "主导 VMware 向 PVE 的迁移改造，兼顾成本优化、资源整合与平台平稳切换。",
  },
  {
    title: "AI 产品交付体系建设",
    summary:
      "负责 AIGC 产品从打包、集成、安装到升级的交付链路建设，推动产品形成可落地方案。",
  },
];

const facts = [
  { label: "Experience", value: "5 年" },
  { label: "City", value: "北京" },
  { label: "Main Track", value: "CI/CD / K8S / AI" },
  { label: "Work Style", value: "方案落地优先" },
];

export default function AboutPage() {
  return (
    <main className="about-shell">
      <section className="about-hero">
        <div className="page-hero-layout">
          <div>
            <span className="section-label">About</span>
            <h1>知行合一，先把技术做成，再把价值做实。</h1>
            <p>
              我是王普霖，网站署名 Clover，常驻北京。5 年运维开发经验，关注
              CI/CD、Kubernetes、虚拟化平台和 AI 应用落地，习惯从工程视角推动方案设计、实施交付与长期维护。
            </p>
            <div className="hero-meta-row">
              {facts.map((fact) => (
                <div key={fact.label} className="hero-meta-card">
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <HeroVisual
            eyebrow="Profile Mesh"
            title="Operator Mindset"
            detail="更关注技术如何变成稳定结果，以及系统如何进入团队的长期工作流。"
            rows={[
              { label: "Discipline", value: "Infra Engineering" },
              { label: "Approach", value: "Execution First" },
              { label: "Direction", value: "AI Application" },
            ]}
            chips={["Kubernetes", "PVE", "CI/CD", "AIGC"]}
          />
        </div>
      </section>

      <section className="about-grid">
        <article className="about-card">
          <span className="section-label">Profile</span>
          <h2>个人概况</h2>
          <div className="about-list">
            <div>
              <span>姓名</span>
              <strong>王普霖 / Clover</strong>
            </div>
            <div>
              <span>城市</span>
              <strong>北京</strong>
            </div>
            <div>
              <span>关注方向</span>
              <strong>AI 实践与可落地方案项目</strong>
            </div>
            <div>
              <span>邮箱</span>
              <strong>19327492161@163.com</strong>
            </div>
          </div>
        </article>

        <article className="about-card">
          <span className="section-label">Strengths</span>
          <h2>能力侧重</h2>
          <ul className="about-points">
            {strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="about-card">
        <span className="section-label">Path</span>
        <h2>实践路径</h2>
        <div className="timeline">
          {timeline.map((item) => (
            <article key={item.title} className="timeline-item">
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-card">
        <span className="section-label">Statement</span>
        <h2>个人表达</h2>
        <p className="about-quote">
          世界不断变化，技术的初心不曾改变。对我来说，技术不应该停留在概念层面，而应该落到稳定、可维护、可交付的工程结果上。
        </p>
      </section>
    </main>
  );
}
