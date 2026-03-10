import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { TEAM, VALUES } from "@/lib/content";
import { createPageMetadata, organizationJsonLd } from "@/lib/seo";

const TIMELINE = [
  {
    year: "2022",
    event: "Echo11 launched with a focus on high-performance business websites.",
  },
  {
    year: "2023",
    event: "Expanded into long-term maintenance retainers and growth operations.",
  },
  {
    year: "2024",
    event: "Built the ecosystem portfolio across editorial, SaaS, and commerce platforms.",
  },
  {
    year: "2025",
    event: "Standardized anti-generic design systems and quality governance workflows.",
  },
];

export const metadata: Metadata = createPageMetadata({
  title: "About | Echo11",
  description:
    "Meet the team behind Echo11 and the principles that drive our industrial web systems.",
  pathname: "/about",
});

export default function AboutPage() {
  return (
    <div className="container-shell page-section">
      <JsonLd schema={organizationJsonLd()} />

      <header className="section-heading">
        <p className="section-marker">About</p>
        <h1>Echo11 is a digital architecture studio built for operators.</h1>
        <p>
          We combine strategic narrative, interaction precision, and production
          engineering in one accountable team.
        </p>
      </header>

      <section className="about-timeline" aria-label="Company timeline">
        {TIMELINE.map((item) => (
          <article key={item.year}>
            <p>{item.year}</p>
            <span>{item.event}</span>
          </article>
        ))}
      </section>

      <section className="about-team" aria-label="Team">
        {TEAM.map((member) => (
          <article key={member.name}>
            <h2>{member.name}</h2>
            <p className="team-role">{member.role}</p>
            <p>{member.bio}</p>
          </article>
        ))}
      </section>

      <section className="about-values" aria-label="Values">
        {VALUES.map((value) => (
          <article key={value.title}>
            <h2>{value.title}</h2>
            <p>{value.description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
