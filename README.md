# AI Infra Notes Prototype

一个面向运维开发工程师的个人网站原型，视觉方向为暗色极简、AI 基础设施面板、博客与项目双核心。

## Run

```bash
npm install
npm run dev
```

默认启动后访问 `http://localhost:3000`。

## Included

- `app/page.tsx`: 首页模块与示例内容
- `app/globals.css`: 视觉系统、布局、背景与动效
- `app/layout.tsx`: 字体与页面元信息
- `app/robots.ts`: robots 配置
- `app/sitemap.ts`: sitemap 生成
- `app/manifest.ts`: PWA manifest
- `app/icon.tsx`: 站点图标生成
- `app/opengraph-image.tsx`: 社交分享图生成
- `app/blog/page.tsx`: 博客列表页
- `app/blog/[slug]/page.tsx`: 博客详情页
- `app/projects/page.tsx`: 项目列表页
- `app/projects/[slug]/page.tsx`: 项目详情页
- `app/studio/page.tsx`: 轻量内容后台
- `app/studio/labs/page.tsx`: Labs 后台
- `app/studio/labs/[slug]/page.tsx`: Labs 独立编辑页
- `app/api/admin/*`: 内容写入 API
- `app/api/admin/upload/route.ts`: 图片上传接口
- `app/media/[fileName]/route.ts`: 上传图片访问路由
- `lib/blog.ts`: 文章元数据与内容映射
- `lib/projects.ts`: 项目元数据与内容映射
- `lib/labs.ts`: Labs 元数据与内容映射
- `lib/admin.ts`: 后台 token 校验
- `lib/content-paths.ts`: 文件存储目录与 slug 规则
- `lib/site.ts`: 站点信息与 URL 配置
- `content-store/blog/*.md`: 博客内容存储
- `content-store/projects/*.md`: 项目内容存储
- `content-store/labs/*.md`: Labs 内容存储
- `Dockerfile`: 云上容器化部署
- `.env.example`: 基础环境变量模板
- `infra/nginx.conf`: 反向代理示例
- `docs/cloud-plan.md`: 上云规划步骤

## Next Step

- 替换为你的真实项目与文章内容
- 增加项目详情页与文章详情页
- 补上导航、关于页和联系方式

## Add Content

现在内容有两种维护方式：

1. 直接访问 `/studio`，通过后台表单新增文章或项目
2. 手动在 `content-store/blog/*.md` 或 `content-store/projects/*.md` 中新增 Markdown 文件

后台写入时需要：

- 配置 `ADMIN_TOKEN`
- 配置可写的 `CONTENT_STORAGE_DIR`

如果你在云上部署，建议把 `CONTENT_STORAGE_DIR` 挂到持久化目录。

图片上传后会生成 `/media/<file>` 地址，可直接写进 Markdown：

```md
![封面图](/media/example.png)
```

后台现在支持：

- 新增文章与项目
- 编辑现有文章与项目
- 删除文章与项目
- 置顶文章与项目
- 设置封面图 URL
- 上传图片并插入 Markdown
- 搜索、状态筛选、排序与分页管理
