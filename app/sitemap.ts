import type { MetadataRoute } from "next";
import { getAllBlogPosts } from "../lib/blog";
import { getAllLabs } from "../lib/labs";
import { getAllProjects } from "../lib/projects";
import { getSiteUrl } from "../lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();
  const [blogPosts, labs, projects] = await Promise.all([
    getAllBlogPosts(),
    getAllLabs(),
    getAllProjects(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/labs`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/projects`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const labRoutes: MetadataRoute.Sitemap = labs.map((lab) => ({
    url: `${siteUrl}/labs/${lab.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.65,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${siteUrl}/projects/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes, ...labRoutes, ...projectRoutes];
}
