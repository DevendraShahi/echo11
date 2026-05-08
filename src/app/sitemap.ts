import type { MetadataRoute } from "next";
import { caseStudies } from "@/data/caseStudies";
import { absoluteUrl } from "@/lib/seo";

const lastModified = new Date();

const publicRoutes: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/services", priority: 0.9, changeFrequency: "monthly" },
  { path: "/work", priority: 0.9, changeFrequency: "weekly" },
  { path: "/process", priority: 0.75, changeFrequency: "monthly" },
  { path: "/methodology", priority: 0.75, changeFrequency: "monthly" },
  { path: "/manifesto", priority: 0.65, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const caseStudyRoutes = caseStudies.map((project) => ({
    url: absoluteUrl(`/work/${project.id}`),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...caseStudyRoutes];
}
