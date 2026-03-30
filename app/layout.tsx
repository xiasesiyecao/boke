import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "../components/site-nav";
import { getSiteUrl, siteConfig } from "../lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  applicationName: siteConfig.name,
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  category: "technology",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="topbar">
          <div className="topbar-inner">
            <Link href="/" className="brand">
              <span className="brand-mark" />
              <span>
                <strong>王普霖</strong>
                <small>Clover / AI Infra Notes</small>
              </span>
            </Link>
            <SiteNav />

            <div className="topbar-actions">
              <a href="mailto:19327492161@163.com" className="ghost-link">
                联系我
              </a>
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
