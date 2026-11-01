import type { Metadata } from "next";
import { absoluteUrl } from "@/lib/seo";
import { LaltinApp } from "./LaltinApp";
import "./laltin.css";

export const metadata: Metadata = {
  alternates: { canonical: absoluteUrl("/laltin") },
  title: "LALTIN — Resort Website Concept | Echo11",
  description:
    "Explore LALTIN, an Echo11 resort website concept with an editorial identity, day-to-night presentation and illustrative stay planner.",
  openGraph: {
    type: "website",
    siteName: "LALTIN EcoResort",
    title: "LALTIN — Resort Website Concept | Echo11",
    description:
      "An Echo11 resort website concept. Stays, rates and travel details are illustrative.",
    images: [{ url: "/laltin/assets/img/hero-day.jpg", width: 2200, height: 1311 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "LALTIN — Resort Website Concept | Echo11",
    description: "An Echo11 resort website concept with an illustrative stay planner.",
    images: ["/laltin/assets/img/hero-day.jpg"],
  },
  other: {
    "theme-color": "#171814",
  },
};

export default function LaltinPage() {
  return (
    <>
      <link
        rel="preload"
        as="image"
        type="image/webp"
        href="/laltin/assets/img/hero-mobile.webp"
        media="(max-width: 639px)"
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        type="image/webp"
        href="/laltin/assets/img/hero-day.webp"
        media="(min-width: 640px)"
        fetchPriority="high"
      />
      <LaltinApp />
    </>
  );
}
