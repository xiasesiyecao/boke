# Cloud Deployment Plan

这个站目前已经调整为适合自托管上云的 Next.js 站点：

- 已启用 `output: "standalone"`，便于生成独立运行产物
- 已补齐 `robots`、`sitemap`、`manifest`、`icon`、`opengraph-image`
- 已提供 `Dockerfile` 与 `infra/nginx.conf`

## 推荐路线

优先建议走这条路径：

1. 本地继续开发
2. 推送到 Git 仓库
3. 购买一台云服务器
4. 用 Docker 部署应用容器
5. 用 Nginx 做反向代理
6. 绑定域名并配置 HTTPS
7. 后续再接 CI/CD 自动部署

这个方案比直接上复杂平台更适合当前阶段，原因是：

- 站点规模不大
- 内容以个人主页、项目页、博客为主
- 你本身是运维开发，更适合掌握完整部署链路
- 后续如果迁移到 Kubernetes，也能沿用容器化产物

## 云上形态建议

### 第一阶段

推荐使用单台 Linux 云服务器：

- `2 vCPU / 2 GB RAM` 起步即可
- 系统建议 `Ubuntu 24.04 LTS` 或 `Debian 12`
- 站点流量不大时，这个规格足够

### 第二阶段

如果后续你要加更多内容或访问量明显增长，可以再升级为：

- `2 vCPU / 4 GB RAM`
- 增加监控、日志采集、备份
- 用 GitHub Actions 或自建 Runner 自动发布

### 第三阶段

如果未来要把这个站作为更完整的平台入口，再考虑：

- 容器编排
- 多环境发布
- Kubernetes / Docker Swarm

当前不建议一开始就上复杂编排，成本高，收益有限。

## 建议准备的资源

上线前先准备好：

- 云服务器 1 台
- 域名 1 个
- DNS 解析权限
- Git 仓库
- 可用邮箱

如果你未来主要面向国内访问，优先考虑国内云厂商节点。  
如果你更看重极简发布体验，也可以考虑平台托管，但当前站点已经按自托管思路做好了准备。

## 部署步骤

### 1. 本地整理

确认本地可以正常构建：

```bash
npm install
npm run build
```

### 2. 推送代码

建议把当前目录放进 Git 仓库：

```bash
git init
git add .
git commit -m "init personal site"
```

然后推到远程仓库。

### 3. 云服务器初始化

在云服务器上完成：

- 创建普通部署用户
- 安装 Docker
- 安装 Nginx
- 开放 `80` 和 `443` 端口
- 配置防火墙

### 4. 站点环境变量

至少准备：

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
ADMIN_TOKEN=replace-with-a-strong-secret
CONTENT_STORAGE_DIR=/app/content-store
NEXT_PUBLIC_MEDIA_BASE=/media
```

这会影响：

- canonical
- sitemap
- robots
- manifest
- Open Graph 链接

### 5. 构建镜像

在项目根目录执行：

```bash
docker build -t clover-site:latest .
```

### 6. 运行容器

```bash
docker run -d \
  --name clover-site \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://your-domain.com \
  -e ADMIN_TOKEN=replace-with-a-strong-secret \
  -e CONTENT_STORAGE_DIR=/app/content-store \
  -v /data/clover-content:/app/content-store \
  clover-site:latest
```

这里的挂载目录 `/data/clover-content` 很关键。

- 文章和项目内容会写到这个目录
- 上传的图片也会写到这个目录下的 `uploads/`
- 容器更新或重建后，内容仍然保留
- 这也是你后续从本地迁到云上之后，继续通过后台发文的基础

### 7. 配置 Nginx

把 `infra/nginx.conf` 放到服务器的 Nginx 配置目录，替换掉其中的域名。  
然后重载 Nginx，把公网 `80/443` 转发到容器的 `3000`。

### 8. 配置 HTTPS

推荐用 Let’s Encrypt：

- 申请证书
- 自动续期
- 强制跳转 HTTPS

### 9. 验证上线结果

上线后检查：

- 首页、项目页、博客页是否正常访问
- `/sitemap.xml`
- `/robots.txt`
- 页面标题、描述、分享图
- 移动端样式

## 后续自动化建议

等第一版稳定后，再补这两个：

1. GitHub Actions 自动构建镜像并推送
2. 云服务器拉取最新镜像后滚动更新

这时你的网站更新路径就会变成：

本地改代码 -> 提交仓库 -> 自动构建 -> 云上更新

而内容新增路径会变成：

浏览器进入 `/studio` -> 输入 `ADMIN_TOKEN` -> 新增文章或项目 -> 写入持久化目录

如果文章里要插图，流程会变成：

1. 在 `/studio` 上传图片
2. 拿到 `/media/xxx.png` 地址
3. 直接插入 Markdown 正文

## 迁移原则

从本地迁到云上时，建议坚持这几个原则：

- 本地与线上使用同一套构建方式
- 线上环境变量与代码解耦
- 先单机稳定，再谈复杂编排
- 先跑通发布链路，再优化自动化

这也是为什么当前方案优先选择：

- Next.js standalone
- Docker
- Nginx reverse proxy

它足够稳，也方便你后续继续演进。
