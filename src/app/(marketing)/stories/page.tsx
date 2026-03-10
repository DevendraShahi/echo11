import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { STORIES } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

const STORY_FILTERS = ["All", "Build", "Growth", "Brand"];

export const metadata: Metadata = createPageMetadata({
  title: "Stories | Echo11",
  description:
    "Long-form case studies on design systems, motion architecture, and conversion strategy from Echo11.",
  pathname: "/stories",
});

export default function StoriesPage() {
  return (
    <div className="container-shell page-section">
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Echo11 Stories",
        }}
      />

      <header className="section-heading">
        <p className="section-marker">Stories</p>
        <h1>Inside the systems we ship and the outcomes they create.</h1>
        <p>
          Detailed breakdowns of architecture decisions, conversion strategy, and
          operational learnings from live projects.
        </p>
      </header>

      <div className="filter-row" role="list" aria-label="Story filters">
        {STORY_FILTERS.map((filter, index) => (
          <span key={filter} className={index === 0 ? "is-active" : ""}>
            {filter}
          </span>
        ))}
      </div>

      <div className="story-grid">
        {STORIES.map((story) => (
          <article key={story.slug} className="story-card">
            <p>{story.category}</p>
            <h2>{story.title}</h2>
            <p>{story.excerpt}</p>
            <span>
              {story.publishedOn} · {story.readTime}
            </span>
            <Link href={`/stories/${story.slug}`}>Open story</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
