import { notFound } from "next/navigation";
import { StudioLabsPanel } from "../../../../components/studio-labs-panel";
import { isAdminSessionActive } from "../../../../lib/admin";
import { getAllLabs, getLab } from "../../../../lib/labs";

export const dynamic = "force-dynamic";

type StudioLabEditorPageProps = {
  params: {
    slug: string;
  };
};

export default async function StudioLabEditorPage({ params }: StudioLabEditorPageProps) {
  const [labs, lab] = await Promise.all([getAllLabs(), getLab(params.slug)]);

  if (!lab) {
    notFound();
  }

  return (
    <main className="about-shell">
      <section className="about-hero">
        <span className="section-label">Studio / Labs Editor</span>
        <h1>编辑 Labs 条目：{lab.title}</h1>
        <p>这里会直接回填当前 Labs 条目内容，适合持续维护实验模块页面和说明文档。</p>
      </section>

      <StudioLabsPanel
        labs={labs}
        initialLabSlug={params.slug}
        initialAuthenticated={isAdminSessionActive()}
      />
    </main>
  );
}
