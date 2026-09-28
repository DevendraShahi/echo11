import type { MetadataRoute } from "next";
import { caseStudies } from "@/data/caseStudies";
import { absoluteUrl } from "@/lib/seo";

const publicRoutes: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastModified: string;
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly", lastModified: "2026-06-09" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-06-09" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly", lastModified: "2026-06-09" },
  { path: "/work", priority: 0.9, changeFrequency: "weekly", lastModified: "2026-06-09" },
  { path: "/process", priority: 0.75, changeFrequency: "monthly", lastModified: "2026-06-09" },
  { path: "/methodology", priority: 0.75, changeFrequency: "monthly", lastModified: "2026-06-09" },
  { path: "/manifesto", priority: 0.65, changeFrequency: "monthly", lastModified: "2026-06-09" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly", lastModified: "2026-06-09" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly", lastModified: "2026-06-09" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly", lastModified: "2026-06-09" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(route.lastModified),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const caseStudyRoutes = caseStudies.map((project) => ({
    url: absoluteUrl(`/work/${project.id}`),
    lastModified: new Date("2026-06-09"),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...caseStudyRoutes];
}
