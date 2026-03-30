import type { MetadataRoute } from "next";
import { getSiteUrl, siteConfig } from "../lib/site";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getSiteUrl();

  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#07111f",
    theme_color: "#07111f",
    icons: [
      {
        src: `${siteUrl}/icon?size=192`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${siteUrl}/icon?size=512`,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
