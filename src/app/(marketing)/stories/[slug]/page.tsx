import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { STORIES, getStoryBySlug } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

type StoryDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const STORY_BODY = [
  "The project started with a hard constraint: remove generic storytelling and move every section toward decision confidence.",
  "We rebuilt hierarchy around trust artifacts, measurable outcomes, and action clarity. Each module had a single job and a direct business hypothesis.",
  "Performance work ran in parallel with narrative work. The launch stack used strict budgets for scripts, media, and runtime complexity.",
  "After launch, we monitored session quality and conversion behavior weekly, then iterated through focused release cycles.",
];

export async function generateStaticParams() {
  return STORIES.map((story) => ({ slug: story.slug }));
}

export async function generateMetadata({ params }: StoryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = getStoryBySlug(slug);

  if (!story) {
    return createPageMetadata({
      title: "Story not found | Echo11",
      description: "Requested story was not found.",
      pathname: `/stories/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${story.title} | Echo11 Stories`,
    description: story.excerpt,
    pathname: `/stories/${story.slug}`,
  });
}

export default async function StoryDetailPage({ params }: StoryDetailPageProps) {
  const { slug } = await params;
  const story = getStoryBySlug(slug);

  if (!story) {
    notFound();
  }

  const related = STORIES.filter((item) => item.slug !== story.slug).slice(0, 2);

  return (
    <article className="container-shell page-section detail-page story-detail">
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: story.title,
          datePublished: story.publishedOn,
          description: story.excerpt,
        }}
      />

      <p className="section-marker">Case story</p>
      <h1>{story.title}</h1>
      <p className="story-meta">
        {story.publishedOn} · {story.readTime}
      </p>

      <div className="story-content">
        {STORY_BODY.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section>
        <h2>Related stories</h2>
        <div className="related-grid">
          {related.map((item) => (
            <article key={item.slug} className="related-card">
              <h3>{item.title}</h3>
              <p>{item.excerpt}</p>
              <Link href={`/stories/${item.slug}`}>Read</Link>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
