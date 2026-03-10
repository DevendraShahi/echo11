"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function ScrollRevealInit() {
  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scroll progress bar
    const progressBar = document.createElement("div");
    progressBar.id = "scroll-progress";
    progressBar.setAttribute("aria-hidden", "true");
    document.body.appendChild(progressBar);

    const ctx = gsap.context(() => {
      // Drive progress bar
      gsap.to("#scroll-progress", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });

      // Find all reveal targets
      const targets = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      if (targets.length === 0) return;

      if (prefersReducedMotion) {
        gsap.set(targets, { autoAlpha: 1, y: 0, x: 0, clipPath: "none" });
        return;
      }

      targets.forEach((target) => {
        const type = target.dataset.reveal;
        const delay = parseFloat(target.dataset.revealDelay ?? "0");

        if (type === "clip") {
          gsap.fromTo(
            target,
            { opacity: 0, y: 24, clipPath: "inset(10% 2% 10% 2% round 4px)" },
            {
              opacity: 1,
              y: 0,
              clipPath: "inset(0% 0% 0% 0% round 4px)",
              duration: 0.72,
              delay,
              ease: "power3.out",
              scrollTrigger: {
                trigger: target,
                start: "top 86%",
                once: true,
              },
            }
          );
        } else if (type === "fade") {
          gsap.fromTo(
            target,
            { opacity: 0, y: 18 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              delay,
              ease: "power2.out",
              scrollTrigger: {
                trigger: target,
                start: "top 88%",
                once: true,
              },
            }
          );
        } else if (type === "stagger") {
          const children = gsap.utils.toArray<HTMLElement>(target.children as HTMLCollectionOf<HTMLElement>);
          gsap.fromTo(
            children,
            { opacity: 0, y: 22 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: target,
                start: "top 86%",
                once: true,
              },
            }
          );
        } else {
          gsap.fromTo(
            target,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              delay,
              ease: "power3.out",
              scrollTrigger: {
                trigger: target,
                start: "top 86%",
                once: true,
              },
            }
          );
        }
      });

      ScrollTrigger.refresh();
    });

    return () => {
      ctx.revert();
      progressBar.remove();
    };
  }, []);

  return null;
}
