"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { WavesBackground } from "@/components/waves-background";

const HERO_SIGNALS = [
  "Asymmetrical spatial experiences",
  "Next.js edge-rendered architecture",
  "GSAP and Three.js motion systems",
  "Sovereign first-party data platforms",
];

export function HeroStage() {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const node = rootRef.current;

    if (!node) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .from("[data-hero='bg']", {
          scale: 1.05,
          opacity: 0,
          duration: 1.2,
        })
        .from(
          "[data-hero='kicker']",
          {
            y: 18,
            opacity: 0,
            duration: 0.45,
          },
          "-=0.8",
        )
        .from(
          "[data-hero='headline']",
          {
            y: 38,
            opacity: 0,
            duration: 0.86,
          },
          "-=0.15",
        )
        .from(
          "[data-hero='body']",
          {
            y: 24,
            opacity: 0,
            duration: 0.62,
          },
          "-=0.44",
        )
        .from(
          "[data-hero='cta']",
          {
            y: 20,
            opacity: 0,
            duration: 0.52,
            stagger: 0.11,
          },
          "-=0.31",
        )
        .from(
          "[data-hero='signal']",
          {
            y: 16,
            opacity: 0,
            duration: 0.46,
            stagger: 0.09,
          },
          "-=0.24",
        )
        .from(
          "[data-hero='cue']",
          {
            opacity: 0,
            y: 9,
            duration: 0.46,
          },
          "-=0.18",
        );
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="hero-stage hero-opening" id="top">
      <div className="hero-waves-layer" data-hero="bg">
        <WavesBackground className="hero-waves-canvas" />
      </div>
      <div className="hero-opening-backdrop" aria-hidden="true" />

      <div className="container-shell hero-opening-content">
        <p className="section-marker hero-kicker" data-hero="kicker">
          Elite Digital Architecture Firm.
        </p>
        <h1 className="hero-headline hero-headline-opening" data-hero="headline">
          Your fractional partner in asymmetric dominance.
        </h1>
        <p className="hero-body hero-body-opening" data-hero="body">
          Engineered for Nepal&apos;s top enterprises and global SaaS exports. We
          eradicate template-driven digital apathy with technical luxury:
          asymmetrical spatial experiences, Next.js edge-rendering, GSAP/Three.js
          motion, and sovereign first-party data platforms.
        </p>

        <div className="hero-cta-row hero-cta-opening">
          <a className="action action-primary" data-hero="cta" href="#contact">
            Initialize Protocol
          </a>
        </div>

        <ul className="hero-signal-row" aria-label="Studio signals">
          {HERO_SIGNALS.map((signal) => (
            <li key={signal} data-hero="signal">
              {signal}
            </li>
          ))}
        </ul>
      </div>

      <a className="hero-scroll-cue" data-hero="cue" href="#services">
        Scroll to discover
      </a>
    </section>
  );
}
