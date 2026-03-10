import { LegalToc } from "@/components/ui/legal-toc";
import type { LegalSection } from "@/lib/content";

type LegalPageProps = {
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
};

export function LegalPage({ title, intro, updatedAt, sections }: LegalPageProps) {
  return (
    <div className="container-shell legal-layout">
      <LegalToc title={title} updatedAt={updatedAt} sections={sections} />

      <article className="legal-content">
        <h1>{title}</h1>
        <p>{intro}</p>

        {sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}
