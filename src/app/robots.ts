import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/lab",
        "/lab/*",
        "/portal",
        "/portal/*",
        "/client",
        "/client/*",
        "/preview-invite",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
