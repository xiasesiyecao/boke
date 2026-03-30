import { notFound } from "next/navigation";
import { StudioPanel } from "../../../../components/studio-panel";
import { isAdminSessionActive } from "../../../../lib/admin";
import { getAllBlogPosts, getBlogPost } from "../../../../lib/blog";
import { getAllProjects } from "../../../../lib/projects";

export const dynamic = "force-dynamic";

type StudioBlogEditorPageProps = {
  params: {
    slug: string;
  };
};

export default async function StudioBlogEditorPage({ params }: StudioBlogEditorPageProps) {
  const [posts, projects, post] = await Promise.all([
    getAllBlogPosts(),
    getAllProjects(),
    getBlogPost(params.slug),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <main className="about-shell">
      <section className="about-hero">
        <span className="section-label">Studio / Blog Editor</span>
        <h1>编辑博客文章：{post.title}</h1>
        <p>这里会直接回填当前文章内容，适合修改正文、摘要、标签与发布日期。</p>
      </section>

      <StudioPanel
        posts={posts}
        projects={projects}
        initialBlogSlug={params.slug}
        initialAuthenticated={isAdminSessionActive()}
      />
    </main>
  );
}
