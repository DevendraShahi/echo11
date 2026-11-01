"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Monitor, Smartphone, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type Lenis from "lenis";
import { Container } from "@/components/ui/Container";
import { liveConcepts } from "@/data/caseStudies";
import styles from "./ConceptSpread.module.css";

const CONCEPTS = liveConcepts.map(project => ({
  id: project.id,
  name: project.title,
  category: project.category,
  description: project.tagline,
  image: project.id === "forge" ? "/showcase/previews/forge.jpg" : project.thumbnail,
  href: project.link!,
  note: "Echo11 studio concept",
}));
type Concept = (typeof CONCEPTS)[number];
interface PreviewOrigin { x: number; y: number; scaleX: number; scaleY: number }

export function ConceptSpread() {
  const [active, setActive] = useState<Concept | null>(null);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [loadState, setLoadState] = useState<"loading" | "ready" | "slow" | "error">("loading");
  const [origin, setOrigin] = useState<PreviewOrigin>({ x: 0, y: 0, scaleX: 1, scaleY: 1 });
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const reduce = useReducedMotion();

  function explore(concept: Concept, event: MouseEvent<HTMLButtonElement>) {
    trigger.current = event.currentTarget;
    const panel = event.currentTarget.closest("article")?.querySelector("figure");
    const rect = (panel ?? event.currentTarget).getBoundingClientRect();
    setOrigin({
      x: rect.left + rect.width / 2 - window.innerWidth / 2,
      y: rect.top + rect.height / 2 - window.innerHeight / 2,
      scaleX: Math.min(1, rect.width / (window.innerWidth - 32)),
      scaleY: Math.min(1, rect.height / (window.innerHeight - 32)),
    });
    setDevice(window.innerWidth < 640 ? "mobile" : "desktop");
    setLoadState("loading");
    setActive(concept);
  }

  useEffect(() => {
    if (!active) return;
    const modal = dialog.current;
    if (!modal) return;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    const wasStopped = lenis?.isStopped;
    const previousOverflow = document.body.style.overflow;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    modal.showModal();
    closeButton.current?.focus();
    const timer = window.setTimeout(() => {
      setLoadState(current => current === "loading" ? "slow" : current);
    }, 12000);
    return () => {
      window.clearTimeout(timer);
      modal.close();
      document.body.style.overflow = previousOverflow;
      if (!wasStopped) lenis?.start();
      trigger.current?.focus({ preventScroll: true });
    };
  }, [active]);

  return (
    <section id="live-concepts" aria-labelledby="concept-spread-heading" className={styles.section}>
      <Container>
        <div className={styles.introduction}>
          <div>
            <p className={styles.label}>The showcase / Live studio concepts</p>
            <h2 id="concept-spread-heading" className={styles.heading}>Distinct worlds.<br /><span>Made to explore.</span></h2>
          </div>
          <div className={styles.lead}>
            <p>A strength club. A mountain retreat. Step inside two studio concepts with a character of their own.</p>
            <Link href="/showcase" className={styles.archive}>The complete showcase <ArrowUpRight aria-hidden="true" size={16} /></Link>
          </div>
        </div>

        <div className={styles.spread}>
          {CONCEPTS.map((concept, index) => (
            <article key={concept.id} className={`${styles.project} ${styles[concept.id]}`}>
              <div className={styles.projectHeading}>
                <span className={styles.number}>0{index + 1}</span>
                <h3 className={styles.projectName}>{concept.name}</h3>
              </div>
              <figure className={styles.plate}>
                <button type="button" className={styles.imageButton} aria-label={`Explore ${concept.name} live website`} aria-haspopup="dialog" onClick={event => explore(concept, event)}>
                  <Image src={concept.image} alt={`${concept.name} concept website homepage`} fill sizes={concept.id === "laltin" ? "(min-width: 1024px) 38vw, 100vw" : "(min-width: 1024px) 60vw, 100vw"} className={styles.image} />
                </button>
              </figure>
              <div className={styles.caption}>
                <div><p className={styles.category}>{concept.category}</p><p className={styles.description}>{concept.description}</p></div>
                <button type="button" className={styles.explore} aria-label={`Explore ${concept.name}`} aria-haspopup="dialog" onClick={event => explore(concept, event)}>Explore <ArrowUpRight aria-hidden="true" size={18} /></button>
              </div>
              <p className={styles.provenance}>{concept.note}</p>
            </article>
          ))}
        </div>
        <div className={styles.closing}>
          <p>A feel for what’s possible.<br /><span>Your website will have a world of its own.</span></p>
          <a href="#fit-check" className={styles.archive}>Find your approach <ArrowUpRight aria-hidden="true" size={16} /></a>
        </div>
      </Container>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby="concept-preview-title" data-lenis-prevent onClose={() => setActive(null)} onCancel={event => { event.preventDefault(); setActive(null); }}>
        {active && (
          <motion.div className={styles.viewer} initial={reduce ? false : { ...origin, opacity: 0 }} animate={{ x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1 }} transition={{ duration: reduce ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}>
            <div className={styles.toolbar}>
              <h3 id="concept-preview-title">{active.name}<span> / Live concept</span></h3>
              <div role="group" aria-label="Preview width" className={styles.devices}>
                <button type="button" aria-label="Desktop preview" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}><Monitor size={17} aria-hidden="true" /></button>
                <button type="button" aria-label="Mobile preview" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}><Smartphone size={17} aria-hidden="true" /></button>
              </div>
              <a href={active.href} target="_blank" rel="noreferrer" className={styles.fullSite}>Open full site <ArrowUpRight size={16} aria-hidden="true" /><span className="sr-only"> (new tab)</span></a>
              <button ref={closeButton} type="button" onClick={() => setActive(null)} className={styles.close} aria-label="Close live preview"><X size={22} aria-hidden="true" /></button>
            </div>
            <div className={styles.viewport}>
              {loadState !== "ready" && <div role="status" className={styles.loading}><p>{loadState === "loading" ? "Opening the website…" : "Preview taking longer than expected."}</p>{loadState !== "loading" && <a href={active.href} target="_blank" rel="noreferrer">Open {active.name} in a new tab ↗</a>}</div>}
              <iframe key={active.id} src={active.href} title={`${active.name} live concept website`} className={`${styles.frame} ${device === "mobile" ? styles.mobileFrame : ""}`} onLoad={() => setLoadState("ready")} onError={() => setLoadState("error")} />
            </div>
            <p className={styles.viewerNote}>{active.note}. Exploration does not change your project brief.</p>
          </motion.div>
        )}
      </dialog>
    </section>
  );
}
