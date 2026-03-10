import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { SERVICE_PANELS, getServiceBySlug } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

type ServiceCategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateStaticParams() {
  return SERVICE_PANELS.map((service) => ({ category: service.slug }));
}

export async function generateMetadata({ params }: ServiceCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const service = getServiceBySlug(category);

  if (!service) {
    return createPageMetadata({
      title: "Service not found | Echo11",
      description: "Requested service was not found.",
      pathname: `/services/${category}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: `${service.title} | Echo11`,
    description: service.summary,
    pathname: `/services/${service.slug}`,
  });
}

export default async function ServiceCategoryPage({ params }: ServiceCategoryPageProps) {
  const { category } = await params;
  const service = getServiceBySlug(category);

  if (!service) {
    notFound();
  }

  return (
    <article className="container-shell page-section detail-page">
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.title,
          description: service.summary,
        }}
      />

      <p className="section-marker">Service category</p>
      <h1>{service.title}</h1>
      <p>{service.summary}</p>
      <p className="detail-highlight">{service.outcomes}</p>

      <section>
        <h2>Delivery framework</h2>
        <ul>
          {service.process.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Ideal for</h2>
        <p>
          Teams that need direct accountability for conversion behavior,
          performance, and long-term release stability.
        </p>
      </section>

      <Link href="/services" className="text-link">
        Back to all services
      </Link>
    </article>
  );
}
