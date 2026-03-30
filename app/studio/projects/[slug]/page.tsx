import { notFound } from "next/navigation";
import { StudioPanel } from "../../../../components/studio-panel";
import { isAdminSessionActive } from "../../../../lib/admin";
import { getAllBlogPosts } from "../../../../lib/blog";
import { getAllProjects, getProject } from "../../../../lib/projects";

export const dynamic = "force-dynamic";

type StudioProjectEditorPageProps = {
  params: {
    slug: string;
  };
};

export default async function StudioProjectEditorPage({
  params,
}: StudioProjectEditorPageProps) {
  const [posts, projects, project] = await Promise.all([
    getAllBlogPosts(),
    getAllProjects(),
    getProject(params.slug),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <main className="about-shell">
      <section className="about-hero">
        <span className="section-label">Studio / Project Editor</span>
        <h1>编辑项目案例：{project.title}</h1>
        <p>这里会直接回填当前项目内容，适合修改职责、结果、技术栈与正文说明。</p>
      </section>

      <StudioPanel
        posts={posts}
        projects={projects}
        initialProjectSlug={params.slug}
        initialAuthenticated={isAdminSessionActive()}
      />
    </main>
  );
}
