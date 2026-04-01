import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGameDevShowcaseItem } from "../../../../lib/game-dev-showcase";

type GamePageProps = {
  params: {
    slug: string;
  };
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const game = getGameDevShowcaseItem(params.slug);

  if (!game) {
    return {
      title: "游戏页面不存在 | 王普霖",
    };
  }

  return {
    title: `${game.name} | Labs Games`,
    description: game.summary,
  };
}

export default function GameDevDetailPage({ params }: GamePageProps) {
  const game = getGameDevShowcaseItem(params.slug);

  if (!game) {
    notFound();
  }

  return (
    <main className="post-shell">
      <div className="post-back">
        <Link href="/labs/game-dev-module">返回游戏模块</Link>
        <Link href="/labs" className="post-edit-link">
          返回 Labs
        </Link>
      </div>

      <article className="post-card game-detail-shell">
        <section className="game-detail-hero">
          <div>
            <div className="article-meta">
              <span>{game.genre}</span>
              <span>{game.stage}</span>
            </div>
            <h1>{game.name}</h1>
            <p>{game.pitch}</p>
            <div className="hero-actions">
              {game.playUrl ? (
                <a
                  href={game.playUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="primary-link"
                >
                  新标签页试玩
                </a>
              ) : (
                <span className="primary-link">试玩入口预留</span>
              )}
              <Link href="/labs/game-dev-module" className="ghost-link">
                返回游戏模块
              </Link>
            </div>
          </div>

          <div className="game-detail-preview">
            <div className="game-detail-preview-head">
              <span>{game.playUrl ? "Live Gameplay View" : "Mock Gameplay View"}</span>
              <strong>{game.headline}</strong>
            </div>
            {game.playUrl ? (
              <div className="game-frame-shell">
                <iframe
                  src={game.playUrl}
                  title={`${game.name} 游戏试玩`}
                  className="game-frame"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="game-detail-preview-screen">
                <div className="game-detail-grid" />
                <div className="game-detail-orb orb-a" />
                <div className="game-detail-orb orb-b" />
                <div className="game-detail-orb orb-c" />
              </div>
            )}
          </div>
        </section>

        <section className="game-detail-board">
          {game.milestones.map((item) => (
            <article key={item.label} className="game-detail-metric">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        <section className="game-detail-grid-wrap">
          <div className="game-detail-card">
            <span className="section-label">Overview</span>
            <h2>当前定位</h2>
            <p>{game.summary}</p>
            <div className="game-detail-inline-meta">
              <span>Tech Stack</span>
              <strong>{game.stack}</strong>
            </div>
            <div className="game-detail-inline-meta">
              <span>Design Focus</span>
              <strong>{game.accent}</strong>
            </div>
          </div>

          <div className="game-detail-card">
            <span className="section-label">Feature Set</span>
            <h2>页面里可以展示什么</h2>
            <ul className="about-points">
              {game.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          </div>
        </section>
      </article>
    </main>
  );
}
