import type { MetadataRoute } from "next";
import { PROJECTS, SERVICE_PANELS, STORIES } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/services",
    "/stories",
    "/work",
    "/pricing",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
    "/accessibility",
  ];

  const now = new Date();

  const staticEntries = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const serviceEntries = SERVICE_PANELS.map((service) => ({
    url: `${SITE_URL}/services/${service.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  const storyEntries = STORIES.map((story) => ({
    url: `${SITE_URL}/stories/${story.slug}`,
    lastModified: new Date(story.publishedOn),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const workEntries = PROJECTS.map((project) => ({
    url: `${SITE_URL}/work/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.65,
  }));

  return [...staticEntries, ...serviceEntries, ...storyEntries, ...workEntries];
}
