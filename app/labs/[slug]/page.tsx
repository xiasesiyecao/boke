import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isAdminSessionActive } from "../../../lib/admin";
import { gameDevShowcase } from "../../../lib/game-dev-showcase";
import { getLab, getLabModuleDisplayName } from "../../../lib/labs";

type LabPageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

const devBoard = [
  { label: "Current Focus", value: "Frontend Game Prototypes" },
  { label: "Cadence", value: "Fast Iteration / Weekly Updates" },
  { label: "Target", value: "Playable in Browser" },
  { label: "Status", value: "1 可玩 / 1 内测 / 1 概念" },
];

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

  const isGameDevModule = lab.module === "Game Dev";

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
            <span>{getLabModuleDisplayName(lab.module)}</span>
            <span>{lab.status}</span>
          </div>
          <h1>{lab.title}</h1>
          <p>{lab.summary}</p>
          <div className="post-tags">
            <span>Lab Track</span>
            <span>{lab.tags.join(" / ")}</span>
          </div>
        </header>

        {isGameDevModule ? (
          <section className="game-lab-shell">
            <div className="game-lab-hero">
              <div className="game-lab-surface">
                <div className="game-lab-surface-copy">
                  <span className="section-label">Game Launchpad</span>
                  <h2>这是一个独立的游戏展示 UI，点击卡片会跳到对应游戏页面。</h2>
                  <p>
                    先用假数据模拟结构。后面你把真实前端游戏接进来时，每个卡片都可以对应一个单独网页，放试玩、截图、更新记录和玩法介绍。
                  </p>
                  <div className="hero-actions">
                    <Link href={`/labs/games/${gameDevShowcase[0].slug}`} className="primary-link">
                      查看示例游戏页
                    </Link>
                    <Link href="/labs" className="ghost-link">
                      返回 Labs 列表
                    </Link>
                  </div>
                </div>

                <div className="game-lab-preview">
                  <div className="game-lab-preview-stage">
                    <span>Featured Build</span>
                    <strong>{gameDevShowcase[0].name}</strong>
                    <small>{gameDevShowcase[0].headline}</small>
                  </div>
                  <div className="game-lab-preview-grid">
                    <div />
                    <div />
                    <div />
                    <div />
                  </div>
                </div>
              </div>
            </div>

            <section className="game-lab-board">
              {devBoard.map((item) => (
                <article key={item.label} className="game-lab-metric">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </section>

            <section className="game-lab-list">
              <div className="section-heading compact">
                <div>
                  <span className="section-label">Current Games</span>
                  <h2>开发中的游戏展示</h2>
                </div>
              </div>

              <div className="game-lab-grid">
                {gameDevShowcase.map((game) => (
                  <Link
                    key={game.slug}
                    href={`/labs/games/${game.slug}`}
                    className="game-lab-card game-lab-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="article-meta">
                      <span>{game.genre}</span>
                      <span>{game.stage}</span>
                    </div>
                    <h3>{game.name}</h3>
                    <p>{game.summary}</p>
                    <div className="game-lab-card-meta">
                      <div>
                        <span>Stack</span>
                        <strong>{game.stack}</strong>
                      </div>
                      <div>
                        <span>Focus</span>
                        <strong>{game.accent}</strong>
                      </div>
                    </div>
                    <div className="game-lab-card-actions">
                      <span className="ghost-link">进入详情页</span>
                      <span className="primary-link">新页面打开</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </section>
        ) : null}

        <div className="post-prose" hidden={isGameDevModule}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{lab.content}</ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
