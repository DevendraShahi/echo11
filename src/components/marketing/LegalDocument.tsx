"use client";

import type { MouseEvent, ReactNode } from "react";
import Link from "next/link";
import type Lenis from "lenis";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/seo";

export interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface DocumentLink {
  href: string;
  label: string;
}

interface LegalDocumentProps {
  name: string;
  sections: LegalSection[];
  overviewTitle: string;
  overviewAction: DocumentLink;
  overviewNote: string;
  summary: { title: string; text: string }[];
  related: DocumentLink;
  contactTitle: string;
  contactText: string;
  emailSubject: string;
}

export const legalLinkStyle = "text-foreground underline decoration-white/30 underline-offset-4 transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";

// Native anchors otherwise compete with the site's smooth-scroll controller.
function navigateSection(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const hash = event.currentTarget.hash;
  const target = document.getElementById(hash.slice(1));
  if (!target) return;
  event.preventDefault();
  // Collapse the mobile index before measuring the destination: its height
  // changes document flow, and an open index would cover the selected text.
  const disclosure = event.currentTarget.closest("details");
  if (disclosure instanceof HTMLDetailsElement) disclosure.open = false;
  const destination = Math.max(0, target.getBoundingClientRect().top + window.scrollY - 128);
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
  if (lenis) lenis.scrollTo(destination, { immediate: reduced, force: true });
  else window.scrollTo({ top: destination, behavior: reduced ? "instant" : "smooth" });
  window.history.pushState(null, "", hash);
  target.focus({ preventScroll: true });
}

function Contents({ name, sections }: Pick<LegalDocumentProps, "name" | "sections">) {
  return (
    <nav aria-label={`${name} sections`}>
      <ol className="space-y-1">
        {[...sections, { id: "contact", title: "Contact the studio" }].map((section, index) => (
          <li key={section.id}>
            <a href={`#${section.id}`} onClick={navigateSection} className="flex min-h-11 items-center gap-3 py-2 text-sm text-muted-foreground transition-colors hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
              <span className="w-5 shrink-0 font-mono text-[10px] text-white/50">{String(index + 1).padStart(2, "0")}</span>
              <span>{section.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function LegalDocument({ name, sections, overviewTitle, overviewAction, overviewNote, summary, related, contactTitle, contactText, emailSubject }: LegalDocumentProps) {
  return (
    <Container className="pb-20 sm:pb-28">
      <section aria-labelledby="legal-overview" className="border-y border-border py-8 sm:py-10">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <h2 id="legal-overview" className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{overviewTitle}</h2>
          <a href={overviewAction.href} onClick={navigateSection} className={`${legalLinkStyle} text-sm`}>{overviewAction.label} <ArrowUpRight aria-hidden className="ml-1 inline h-4 w-4" /></a>
        </div>
        <div className="grid gap-7 md:grid-cols-3 md:gap-10">
          {summary.map(item => (
            <div key={item.title}>
              <h3 className="mb-3 text-lg font-medium text-foreground">{item.title}</h3>
              <p className="text-base leading-7 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-7 text-sm leading-6 text-muted-foreground">{overviewNote}</p>
      </section>
      <div className="mt-10 grid items-start gap-10 lg:mt-16 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-16 xl:gap-24">
        <aside className="hidden lg:sticky lg:top-28 lg:block lg:max-h-[calc(100dvh-9rem)] lg:overflow-y-auto">
          <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">On this page</p>
          <Contents name={name} sections={sections} />
          <Link href={related.href} className={`${legalLinkStyle} mt-6 inline-flex items-center gap-2 text-sm`}>{related.label} <ArrowUpRight aria-hidden className="h-4 w-4" /></Link>
        </aside>
        <div className="min-w-0 max-w-[740px]">
          <details className="group sticky top-[var(--nav-height,60px)] z-30 mb-10 border-y border-border bg-background lg:hidden">
            <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-4 font-mono text-xs uppercase tracking-widest text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent">Jump to a section <ChevronDown aria-hidden className="h-4 w-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" /></summary>
            <div data-lenis-prevent className="max-h-[calc(100dvh-var(--nav-height,60px)-5rem)] overflow-y-auto overscroll-contain pb-4"><Contents name={name} sections={sections} /></div>
          </details>
          {sections.map((section, index) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`} tabIndex={-1} className="scroll-mt-32 border-b border-border pb-10 pt-10 first:pt-0 sm:pb-12 sm:pt-12">
              <div className="mb-6 flex items-baseline gap-4">
                <span aria-hidden className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <h2 id={`${section.id}-heading`} className="text-[clamp(1.4rem,2.2vw,1.85rem)] font-medium leading-tight tracking-tight text-foreground">{section.title}</h2>
              </div>
              <div className="space-y-5 text-base leading-[1.85] text-white/75">{section.content}</div>
            </section>
          ))}
          <section id="contact" aria-labelledby="legal-contact" tabIndex={-1} className="scroll-mt-32 pt-10 sm:pt-12">
            <p className="mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">{String(sections.length + 1).padStart(2, "0")} / Contact</p>
            <h2 id="legal-contact" className="mb-4 text-3xl font-medium tracking-tight text-foreground">{contactTitle}</h2>
            <p className="mb-6 text-base leading-7 text-white/75">{contactText}</p>
            <a href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(emailSubject)}`} className={`${legalLinkStyle} inline-flex min-h-11 max-w-full items-center gap-3 break-all text-base sm:text-xl`}>{siteConfig.email}<ArrowUpRight aria-hidden className="h-5 w-5 shrink-0" /></a>
            <div className="mt-8 flex flex-wrap gap-6 border-t border-border pt-6 text-sm">
              <Link href={related.href} className={legalLinkStyle}>{related.label}</Link>
              <a href="#top" onClick={navigateSection} className={legalLinkStyle}>Back to top</a>
            </div>
          </section>
        </div>
      </div>
    </Container>
  );
}
