import { StudioLabsPanel } from "../../../components/studio-labs-panel";
import { isAdminSessionActive } from "../../../lib/admin";
import { getAllLabs } from "../../../lib/labs";

export const dynamic = "force-dynamic";

export default async function StudioLabsPage() {
  const labs = await getAllLabs();

  return (
    <main className="about-shell">
      <section className="about-hero">
        <span className="section-label">Studio / Labs</span>
        <h1>管理 Labs 内容</h1>
        <p>这里负责维护实验模块条目，后续游戏开发、运维脚本和实验想法都可以从这里持续扩展。</p>
      </section>

      <StudioLabsPanel labs={labs} initialAuthenticated={isAdminSessionActive()} />
    </main>
  );
}
