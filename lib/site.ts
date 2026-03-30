export const siteConfig = {
  name: "王普霖 | Clover",
  shortName: "Clover",
  description:
    "王普霖的个人技术站，聚焦 CI/CD、Kubernetes、虚拟化平台与 AI 应用落地。",
  defaultUrl: "http://localhost:3000",
  author: "王普霖",
  email: "19327492161@163.com",
  github: "https://github.com/xiasesiyecao",
  keywords: [
    "王普霖",
    "Clover",
    "运维开发",
    "CI/CD",
    "Kubernetes",
    "PVE",
    "AIGC",
    "AI 应用",
    "平台工程",
  ],
} as const;

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || siteConfig.defaultUrl;
}
