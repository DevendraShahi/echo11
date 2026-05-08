import { caseStudies, getCaseStudy } from "@/data/caseStudies";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, breadcrumbJsonLd, createMetadata } from "@/lib/seo";
import { CaseStudyContent } from "./CaseStudyContent";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return caseStudies.map((project) => ({
    slug: project.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const project = getCaseStudy(slug);
  
  if (!project) {
    return { title: "Project Not Found | echo11" };
  }
  
  return createMetadata({
    title: `${project.title} | echo11`,
    description: project.description,
    path: `/work/${project.id}`,
    image: project.thumbnail,
    type: "article",
  });
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getCaseStudy(slug);
  
  if (!project) {
    notFound();
  }
  
  const currentIndex = caseStudies.findIndex(p => p.id === project.id);
  const nextProject = caseStudies[(currentIndex + 1) % caseStudies.length];
  const prevProject = caseStudies[(currentIndex - 1 + caseStudies.length) % caseStudies.length];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", item: absoluteUrl("/") },
          { name: "Work", item: absoluteUrl("/work") },
          { name: project.title, item: absoluteUrl(`/work/${project.id}`) },
        ])}
      />
      <CaseStudyContent
        project={project}
        prevProject={prevProject}
        nextProject={nextProject}
      />
    </>
  );
}
