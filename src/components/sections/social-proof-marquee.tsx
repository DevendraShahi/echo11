"use client";

import { useEffect, useRef } from "react";

const PROJECTS = [
  { name: "the-leadersnp", url: "https://the-leadersnp.com" },
  { name: "prika", url: "https://prika.vercel.app" },
  { name: "studentstack", url: "https://studentstack.vercel.app" },
  { name: "3am3d", url: "https://3am3d.vercel.app" },
  { name: "ExpresssocialNP", url: "https://devendrashahi.github.io/ExpressSocialNP" },
  { name: "Green-Lifestyle", url: "https://devendrashahi.pythonanywhere.com" },
  { name: "trueluxenepal", url: "https://trueluxenepal.vercel.app" }
];

const ALL = [...PROJECTS, ...PROJECTS, ...PROJECTS];
const REVD = [...PROJECTS].reverse();
const REVD_ALL = [...REVD, ...REVD, ...REVD];

export function SocialProofMarquee() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const tracks = el.querySelectorAll<HTMLElement>(".mq-track");

    const obs = new IntersectionObserver(
      ([entry]) => {
        const state = entry?.isIntersecting ? "running" : "paused";
        tracks.forEach((t) => (t.style.animationPlayState = state));
      },
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="mq-section" aria-label="Trusted by our clients">
      <p className="mq-eyebrow">Trusted by ambitious teams</p>

      <div className="mq-mask">
        <div className="mq-track mq-fwd" aria-hidden="true">
          {ALL.map((p, i) => (
            <a key={i} href={p.url} className="mq-chip" target="_blank" rel="noopener noreferrer" aria-label={`Visit ${p.name}`}>
              <span className="mq-dot" />
              {p.name}
            </a>
          ))}
        </div>
      </div>

      <div className="mq-mask">
        <div className="mq-track mq-rev" aria-hidden="true">
          {REVD_ALL.map((p, i) => (
            <a key={i} href={p.url} className="mq-chip mq-chip-dim" target="_blank" rel="noopener noreferrer" aria-label={`Visit ${p.name}`}>
              <span className="mq-dot mq-dot-alt" />
              {p.name}
            </a>
          ))}
        </div>
      </div>

      <p className="sr-only">Clients include: {PROJECTS.map(p => p.name).join(", ")}</p>
    </section>
  );
}
