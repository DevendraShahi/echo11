"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { trackEvent } from "@/lib/analytics";
import type { ProjectItem } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

type SignatureWorkRailProps = {
  projects: ProjectItem[];
};

type WorkRailCardProps = {
  index: number;
  project: ProjectItem;
  active: boolean;
  onMount: (node: HTMLElement | null) => void;
};

function WorkRailCard({ index, project, active, onMount }: WorkRailCardProps) {
  return (
    <article
      className={active ? "signature-work-card is-active" : "signature-work-card"}
      ref={onMount}
      aria-current={active ? "true" : undefined}
    >
      <div className="signature-work-media" aria-hidden="true">
        <span className="signature-work-industry">{project.industry}</span>
        <div className="signature-work-glyph" />
      </div>

      <div className="signature-work-content">
        <p className="signature-work-index">{String(index + 1).padStart(2, "0")}</p>
        <h3>{project.name}</h3>
        <p className="signature-work-overview">{project.overview}</p>

        <ul className="signature-work-metrics" aria-label={`${project.name} highlights`}>
          <li>
            <strong>Impact</strong>
            <span>{project.result}</span>
          </li>
          <li>
            <strong>Stack</strong>
            <span>{project.stack.join(" · ")}</span>
          </li>
        </ul>

        <Link
          href={`/work/${project.slug}`}
          className="signature-work-link"
          onClick={() =>
            trackEvent("cta_click", {
              cta_id: `selected_work_${project.slug}`,
              position: "selected_work",
            })
          }
        >
          View Case Study
        </Link>
      </div>
    </article>
  );
}

export function SignatureWorkRail({ projects }: SignatureWorkRailProps) {
  const preparedProjects = useMemo(() => projects.slice(0, 6), [projects]);
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const viewport = viewportRef.current;
    const rail = railRef.current;

    if (!section || !viewport || !rail || preparedProjects.length === 0) {
      return;
    }

    cardRefs.current = cardRefs.current.slice(0, preparedProjects.length);

    const setActiveSafely = (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(preparedProjects.length - 1, nextIndex));
      if (activeIndexRef.current === clamped) {
        return;
      }
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
    };

    setActiveSafely(0);

    const setupObserver = () => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const nodeIndex = cardRefs.current.findIndex((node) => node === entry.target);
            if (nodeIndex >= 0) {
              setActiveSafely(nodeIndex);
            }
          });
        },
        {
          root: viewport,
          threshold: 0.55,
        },
      );

      cardRefs.current.forEach((card) => {
        if (card) {
          observer.observe(card);
        }
      });

      return () => observer.disconnect();
    };

    if (reducedMotion || preparedProjects.length < 2) {
      return setupObserver();
    }

    const mm = gsap.matchMedia();

    mm.add("(min-width: 1081px)", () => {
      const cards = cardRefs.current.filter((card): card is HTMLElement => Boolean(card));

      if (cards.length < 2) {
        return setupObserver();
      }

      const entrance = gsap.from(cards, {
        opacity: 0,
        y: 24,
        x: (index) => (index % 2 === 0 ? -24 : 24),
        duration: 0.62,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 72%",
          once: true,
        },
      });

      const travelDistance = () => Math.max(0, rail.scrollWidth - viewport.clientWidth);
      const snapStep = 1 / (preparedProjects.length - 1);

      const travelTween = gsap.to(rail, {
        x: () => -travelDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${travelDistance() + window.innerHeight * 0.72}`,
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          snap: {
            snapTo: (value: number) => Math.round(value / snapStep) * snapStep,
            duration: { min: 0.12, max: 0.26 },
            delay: 0.03,
            ease: "power1.inOut",
          },
          onUpdate: (self) => {
            const nextIndex = Math.round(self.progress * (preparedProjects.length - 1));
            setActiveSafely(nextIndex);
          },
        },
      });

      return () => {
        entrance.kill();
        travelTween.kill();
      };
    });

    mm.add("(max-width: 1080px)", () => setupObserver());

    return () => mm.revert();
  }, [preparedProjects, reducedMotion]);

  return (
    <section
      className={
        reducedMotion
          ? "signature-work section-block is-reduced-motion"
          : "signature-work section-block"
      }
      id="selected-work"
      ref={sectionRef}
    >
      <div className="container-shell signature-work-header">
        <p className="section-marker">Selected Work</p>
        <h2>Outcomes, shipped.</h2>
        <p>
          Scroll down to move through our work. Each piece takes focus as the rail progresses
          horizontally.
        </p>
      </div>

      <div className="container-shell signature-work-viewport" ref={viewportRef}>
        <div className="signature-work-rail" ref={railRef}>
          {preparedProjects.map((project, index) => (
            <WorkRailCard
              key={project.slug}
              index={index}
              project={project}
              active={activeIndex === index}
              onMount={(node) => {
                cardRefs.current[index] = node;
              }}
            />
          ))}
        </div>
      </div>

      <div className="container-shell">
        <ol className="signature-work-progress" aria-label="Selected work progress">
          {preparedProjects.map((project, index) => (
            <li
              key={project.slug}
              className={activeIndex === index ? "is-active" : ""}
              aria-current={activeIndex === index ? "step" : undefined}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
