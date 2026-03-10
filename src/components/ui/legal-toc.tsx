import type { LegalSection } from "@/lib/content";

type LegalTocProps = {
  title: string;
  sections: LegalSection[];
  updatedAt: string;
};

export function LegalToc({ title, sections, updatedAt }: LegalTocProps) {
  return (
    <aside className="legal-toc" aria-label="Table of contents">
      <p className="section-marker">{title}</p>
      <p className="legal-updated">Last updated: {updatedAt}</p>
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <a href={`#${section.id}`}>{section.title}</a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
