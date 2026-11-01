"use client";

import { useEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * GSAP choreography for the LALTIN showcase — ported from the static
 * motion.js and extended. Everything is scoped to the root element and
 * fully reverted on unmount. Under prefers-reduced-motion the hook is a
 * no-op and the CSS static fallbacks stand.
 *
 * UI-state motion (menu, dialogs, experience crossfade) stays on
 * framer-motion in the components — GSAP owns load + scroll only.
 */
export function useLaltinMotion(rootRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    root.classList.add("anim");

    const ctx = gsap.context(() => {
      const q = (sel: string) => gsap.utils.toArray<HTMLElement>(sel);

      /* ---------- hero arrival (new cover layout) ---------- */
      const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });
      const heroImg = q("[data-hero-img]")[0];
      if (heroImg) {
        heroTl.from(heroImg, { autoAlpha: 0, scale: 1.05, duration: 2.0, ease: "power2.out" }, 0);
      }
      const heroLocation = q("[data-hero-location]")[0];
      if (heroLocation) {
        heroTl.from(heroLocation, { autoAlpha: 0, duration: 1.0, ease: "power2.out" }, 0.6);
      }
      const heroPanel = q("[data-hero-panel]")[0];
      if (heroPanel) {
        heroTl.from(heroPanel, { autoAlpha: 0, duration: 1.0, ease: "power2.out" }, 0.15);
      }
      const heroTitle = q(".hero__title")[0];
      if (heroTitle) {
        heroTl.from(heroTitle, { autoAlpha: 0, y: 16, duration: 1.2, ease: "power3.out" }, 0.3);
      }
      const heroMeta = q("[data-hero-meta]")[0];
      if (heroMeta) {
        heroTl.from(heroMeta, { autoAlpha: 0, y: 12, duration: 1.0, ease: "power2.out" }, 0.5);
      }

      /* ---------- section 01 interruption statement reveal ---------- */
      const interruptionEl = q(".interruption")[0];
      if (interruptionEl) {
        const rail = interruptionEl.querySelector<HTMLElement>("[data-interruption-rail]");
        const stmt = interruptionEl.querySelector<HTMLElement>("[data-interruption-statement]");
        const footnote = interruptionEl.querySelector<HTMLElement>("[data-interruption-footnote]");

        const interruptionTl = gsap.timeline({
          scrollTrigger: {
            trigger: interruptionEl,
            start: "top 85%",
            once: true,
          },
          defaults: { ease: "power2.out" },
        });

        if (rail) {
          interruptionTl.from(
            rail,
            {
              autoAlpha: 0,
              duration: 0.8,
            },
            0
          );
        }
        if (stmt) {
          interruptionTl.from(
            stmt,
            {
              autoAlpha: 0,
              y: 14,
              duration: 1.1,
            },
            0.15
          );
        }
        if (footnote) {
          interruptionTl.from(
            footnote,
            {
              autoAlpha: 0,
              y: 10,
              duration: 0.9,
            },
            0.35
          );
        }
      }

      /* ---------- section 02 place reveal ---------- */
      const placeEl = q(".place")[0];
      if (placeEl) {
        const placeMainImg = placeEl.querySelector<HTMLElement>("[data-place-main] img");
        const placeEditorial = placeEl.querySelector<HTMLElement>("[data-place-editorial]");
        const placeSecondary = placeEl.querySelector<HTMLElement>("[data-place-secondary]");

        const placeTl = gsap.timeline({
          scrollTrigger: {
            trigger: placeEl,
            start: "top 85%",
            once: true,
          },
          defaults: { ease: "power2.out" },
        });

        if (placeMainImg) {
          placeTl.from(
            placeMainImg,
            {
              autoAlpha: 0,
              scale: 1.03,
              duration: 1.1,
            },
            0
          );
        }
        if (placeEditorial) {
          placeTl.from(
            placeEditorial,
            {
              autoAlpha: 0,
              y: 14,
              duration: 1.0,
            },
            0.18
          );
        }
        if (placeSecondary) {
          placeTl.from(
            placeSecondary,
            {
              autoAlpha: 0,
              y: 12,
              duration: 1.0,
            },
            0.35
          );
        }
      }

      /* ---------- section 03 stay reveals & pinned room journey ---------- */
      const stayHeader = q(".stay__header")[0];
      if (stayHeader) {
        gsap.from(stayHeader, {
          autoAlpha: 0,
          y: 14,
          duration: 1.0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: stayHeader,
            start: "top 85%",
            once: true,
          },
        });
      }

      const journeyEl = q("[data-stay-journey]")[0];
      const stageEl = q("[data-stay-stage]")[0];
      const slides = q("[data-stay-slide]");

      if (journeyEl && stageEl && slides.length > 0) {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 640px)", () => {
          // Set initial slide states
          slides.forEach((slide, i) => {
            const photo = slide.querySelector<HTMLElement>(".stay__slide-photo");
            const content = slide.querySelector<HTMLElement>(".stay__slide-content");

            if (i === 0) {
              gsap.set(slide, { autoAlpha: 1, zIndex: 1 });
              if (photo) gsap.set(photo, { scale: 1.15, transformOrigin: "center center" });
              if (content) gsap.set(content, { autoAlpha: 1, y: 0 });
            } else {
              gsap.set(slide, { autoAlpha: 0, zIndex: i + 1 });
              if (photo) gsap.set(photo, { scale: 1.15, transformOrigin: "center center" });
              if (content) gsap.set(content, { autoAlpha: 0, y: 24 });
            }
          });

          // Pinned scrub timeline across the room journey
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: journeyEl,
              start: "top top",
              end: "bottom bottom",
              pin: stageEl,
              pinSpacing: true,
              scrub: 1.0,
              anticipatePin: 1,
            },
            defaults: { ease: "none" },
          });

          // Slide 0: settle photo from 1.15 down to 1.0
          const photo0 = slides[0].querySelector<HTMLElement>(".stay__slide-photo");
          if (photo0) {
            tl.to(photo0, { scale: 1.0, duration: 0.8 }, 0);
          }

          // Transitions for slides 1, 2, 3
          for (let i = 1; i < slides.length; i++) {
            const prevSlide = slides[i - 1];
            const currSlide = slides[i];
            const prevContent = prevSlide.querySelector<HTMLElement>(".stay__slide-content");
            const currPhoto = currSlide.querySelector<HTMLElement>(".stay__slide-photo");
            const currContent = currSlide.querySelector<HTMLElement>(".stay__slide-content");

            const tStart = i;

            // Fade out previous content
            if (prevContent) {
              tl.to(prevContent, { autoAlpha: 0, y: -12, duration: 0.25 }, tStart - 0.25);
            }

            // Crossfade into current slide
            tl.to(currSlide, { autoAlpha: 1, duration: 0.5 }, tStart - 0.25);

            // Settle current photo scale from 1.15 down to 1.0
            if (currPhoto) {
              tl.to(currPhoto, { scale: 1.0, duration: 0.9 }, tStart - 0.25);
            }

            // Fade in and lift current content
            if (currContent) {
              tl.to(currContent, { autoAlpha: 1, y: 0, duration: 0.4 }, tStart);
            }

            // Hide previous slide after crossfade
            tl.set(prevSlide, { autoAlpha: 0 }, tStart + 0.3);
          }

          // Settle time for Family Retreat before unpinning
          tl.to({}, { duration: 0.5 });
        });
      }

      /* ---------- section 04 morning dawn sequence ---------- */
      const morningEl = q("[data-morning]")[0];
      if (morningEl) {
        const morningHeader = morningEl.querySelector<HTMLElement>("[data-morning-header]");
        const eyebrow = morningEl.querySelector<HTMLElement>("[data-morning-eyebrow]");
        const title = morningEl.querySelector<HTMLElement>("[data-morning-title]");
        const mist = morningEl.querySelector<HTMLElement>("[data-morning-mist]");
        const photo = morningEl.querySelector<HTMLElement>("[data-morning-photo]");
        const time = morningEl.querySelector<HTMLElement>("[data-morning-time]");
        const stamp = morningEl.querySelector<HTMLElement>("[data-morning-stamp]");

        // Initial header entrance
        if (morningHeader) {
          gsap.from(morningHeader, {
            autoAlpha: 0,
            y: 14,
            duration: 1.0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: morningHeader,
              start: "top 85%",
              once: true,
            },
          });
        }

        // Dawn transition timeline scrubbed to scroll
        const morningTl = gsap.timeline({
          scrollTrigger: {
            trigger: morningEl,
            start: "top 80%",
            end: "bottom 70%",
            scrub: 1.0,
          },
          defaults: { ease: "none" },
        });

        // 1. Dawn background shifts from pine black to light bone
        morningTl.fromTo(
          morningEl,
          { backgroundColor: "#131a15" },
          { backgroundColor: "#efe9dc", duration: 1.0 },
          0
        );

        // 2. Pre-dawn mist clears and photo slowly brightens to natural morning light
        if (mist) {
          morningTl.fromTo(
            mist,
            { autoAlpha: 0.35 },
            { autoAlpha: 0, duration: 0.8 },
            0.1
          );
        }
        if (photo) {
          morningTl.fromTo(
            photo,
            { filter: "brightness(0.90)" },
            { filter: "brightness(1.0)", duration: 0.8 },
            0.1
          );
        }

        // 3. Contrast-safe text color transition:
        // Holds bone (#ede7d9) while background is dark (0.0 to 0.45),
        // then smoothly transitions to ink (#171c18) as background reaches daylight tones (0.45 to 0.70).
        if (title) {
          morningTl.fromTo(
            title,
            { color: "#ede7d9" },
            { color: "#171c18", duration: 0.25 },
            0.45
          );
        }
        if (eyebrow) {
          morningTl.fromTo(
            eyebrow,
            { color: "#ede7d9" },
            { color: "rgba(23, 28, 24, 0.70)", duration: 0.25 },
            0.45
          );
        }
        if (time) {
          morningTl.fromTo(
            time,
            { color: "#ede7d9" },
            { color: "#171c18", duration: 0.25 },
            0.50
          );
        }
        if (stamp) {
          morningTl.fromTo(
            stamp,
            { color: "#ede7d9" },
            { color: "rgba(23, 28, 24, 0.70)", duration: 0.25 },
            0.50
          );
        }
      }

      /* ---------- line reveals (§39) ---------- */
      const parents: HTMLElement[] = [];
      q(".line-mask").forEach((mask) => {
        const p = mask.parentElement as HTMLElement | null;
        if (p && p !== document.body && !parents.includes(p) && !p.closest(".hero") && !p.closest(".dialog")) {
          parents.push(p);
        }
      });
      parents.forEach((p) => {
        const spans = Array.from(p.querySelectorAll<HTMLElement>(".line-mask > span")).filter(
          (s) => s.parentElement?.parentElement === p && !s.closest(".dialog")
        );
        if (!spans.length) return;
        gsap.to(spans, {
          y: "0%",
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: { trigger: p, start: "top 86%", once: true },
        });
      });

      /* ---------- label reveals ---------- */
      q(".lbl-reveal").forEach((el) => {
        if (el.closest(".dialog")) return;
        gsap.to(el, {
          autoAlpha: 1,
          letterSpacing: ".08em",
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });

      /* ---------- generic fade-ups ---------- */
      q("[data-reveal]").forEach((el) => {
        if (el.closest(".dialog")) return;
        gsap.to(el, {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      /* ---------- window reveals (§17) ---------- */
      q(".win").forEach((frame) => {
        if (frame.closest(".dialog")) return;
        const img = frame.querySelector(":scope > img");
        if (!img) return;
        gsap.set(img, { transition: "none" });
        gsap.to(img, {
          scale: 1,
          y: 0,
          duration: 1.3,
          ease: "power3.out",
          onComplete: () => gsap.set(img, { clearProps: "transition" }),
          scrollTrigger: { trigger: frame, start: "top 85%", once: true },
        });
      });

      /* ---------- parallax (±3%, §40) ---------- */
      q("[data-parallax]").forEach((frame) => {
        const img = frame.querySelector("img");
        if (!img) return;
        gsap.fromTo(
          img,
          { yPercent: -3 },
          {
            yPercent: 3,
            ease: "none",
            immediateRender: true,
            scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });

      /* ---------- lantern sequence (§29) ---------- */
      q("[data-lantern]").forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          scale: 0.94,
          duration: 1.1,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
        });
      });

      /* ---------- dusk five-stop scrub (§28) ---------- */
      function parseColor(value: string | null): [number, number, number] | null {
        if (!value) return null;
        value = value.trim();
        if (value.startsWith("#")) {
          let hex = value.slice(1);
          if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
          }
          if (hex.length !== 6) return null;
          return [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
        }
        const m = value.match(/rgba?\(\s*(\d+)\D+(\d+)\D+(\d+)/);
        if (m) return [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
        return null;
      }

      function mix(a: [number, number, number], b: [number, number, number], t: number) {
        return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(
          a[2] + (b[2] - a[2]) * t
        )})`;
      }

      function mixStops(stops: [number, number, number][], t: number) {
        if (stops.length < 2) return stops[0] ? `rgb(${stops[0].join(",")})` : "";
        const scaled = t * (stops.length - 1);
        const i = Math.min(Math.floor(scaled), stops.length - 2);
        return mix(stops[i], stops[i + 1], scaled - i);
      }

      const duskEl = q(".dusk")[0];
      if (duskEl) {
        const css = getComputedStyle(root);
        const stops = (
          [
            parseColor(css.getPropertyValue("--laltin-paper")),
            parseColor(css.getPropertyValue("--laltin-linen")),
            parseColor(css.getPropertyValue("--laltin-earth")),
            parseColor(css.getPropertyValue("--laltin-forest")),
            parseColor(css.getPropertyValue("--laltin-ink")),
          ] as ([number, number, number] | null)[]
        ).filter((c): c is [number, number, number] => c !== null);

        if (stops.length >= 2) {
          const muted = parseColor(css.getPropertyValue("--laltin-muted-text")) ?? stops[0];
          const linen = parseColor(css.getPropertyValue("--laltin-linen")) ?? stops[stops.length - 1];
          const eyebrow = duskEl.querySelector<HTMLElement>(".dusk__head .eyebrow");
          const proxy = { t: 0 };
          const scopeBg = root;

          gsap.to(proxy, {
            t: 1,
            ease: "none",
            scrollTrigger: { trigger: duskEl, start: "top 70%", end: "bottom 40%", scrub: 0.5 },
            onUpdate: () => {
              scopeBg.style.backgroundColor = mixStops(stops, proxy.t);
              if (eyebrow) eyebrow.style.color = mix(muted, linen, proxy.t);
            },
          });
        }
      }

      /* ---------- footer columns rise (new) ---------- */
      const footerCols = q(".footer__col, .footer__brand");
      if (footerCols.length) {
        gsap.from(footerCols, {
          y: 28,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: ".footer", start: "top 88%", once: true },
        });
      }

      /* ---------- nav scroll progress hairline (new) ---------- */
      const progress = q("[data-nav-progress]")[0];
      if (progress) {
        gsap.to(progress, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
        });
      }

      ScrollTrigger.refresh();
    }, root);

    /* delayed refresh — fonts/images land after first paint */
    const t1 = window.setTimeout(() => ScrollTrigger.refresh(), 800);
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      window.clearTimeout(t1);
      window.removeEventListener("load", onLoad);
      ctx.revert();
      root.classList.remove("anim");
      root.style.backgroundColor = "";
    };
  }, [rootRef]);
}
