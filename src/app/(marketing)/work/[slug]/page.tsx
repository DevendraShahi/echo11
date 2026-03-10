import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { PROJECTS, getProjectBySlug } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

type WorkDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return createPageMetadata({
      title: "Case study not found | Echo11",
      description: "Requested case study could not be found.",
      pathname: `/work/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${project.name} | Echo11 Work`,
    description: project.overview,
    pathname: `/work/${project.slug}`,
  });
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <article className="container-shell page-section detail-page">
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.name,
          description: project.overview,
          keywords: project.stack.join(", "),
        }}
      />

      <p className="section-marker">Case study</p>
      <h1>{project.name}</h1>
      <p>{project.overview}</p>

      <section className="split-detail">
        <div>
          <h2>Industry and stack</h2>
          <p>{project.industry}</p>
          <ul>
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        </div>

        <div>
          <h2>Measured impact</h2>
          <p className="detail-highlight">{project.result}</p>
          <p>
            Delivery included baseline audits, design system implementation,
            production QA, and optimization sprints after launch.
          </p>
        </div>
      </section>

      <Link href="/work" className="text-link">
        Back to all work
      </Link>
    </article>
  );
}
