import { StudioPanel } from "../../components/studio-panel";
import { isAdminSessionActive } from "../../lib/admin";
import { getAllBlogPosts } from "../../lib/blog";
import { getAllProjects } from "../../lib/projects";

export const dynamic = "force-dynamic";

export default async function StudioPage() {
  const [posts, projects] = await Promise.all([getAllBlogPosts(), getAllProjects()]);
  const isAuthenticated = isAdminSessionActive();

  return (
    <main className="about-shell">
      <section className="about-hero">
        <span className="section-label">Studio</span>
        <h1>轻量内容后台，面向云上自托管发布。</h1>
        <p>
          当前后台使用 Next.js Route Handler 写入文件存储。适合你后续把站点迁到云服务器后，通过持久化目录继续新增博客和项目内容。
        </p>
        <div className="section-cta">
          <a href="/studio/labs" className="ghost-link">
            进入 Labs 后台
          </a>
        </div>
      </section>

      <StudioPanel
        posts={posts}
        projects={projects}
        initialAuthenticated={isAuthenticated}
      />
    </main>
  );
}
