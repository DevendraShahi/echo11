"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type LenisWindow = Window & { __lenis?: Lenis };

/**
 * Lenis smooth scrolling wired into GSAP's ticker so ScrollTrigger reads one
 * consistent scroll source. Native scroll is preserved (no scroll-jacking), so
 * position: sticky and overflow-x: clip in globals.css keep working unchanged.
 *
 * Stands down entirely under prefers-reduced-motion: the page falls back to
 * native scrolling and every GSAP reveal degrades to its static state.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    (window as LenisWindow).__lenis = lenis;

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    // Fonts and webp screenshots land after first paint; refresh once settled.
    const refreshTimer = window.setTimeout(refresh, 1200);

    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(refreshTimer);
      gsap.ticker.remove(raf);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      delete (window as LenisWindow).__lenis;
    };
  }, []);

  // Honour section links across routes instead of resetting their destination.
  useEffect(() => {
    let target: HTMLElement | null = null;
    try {
      target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    } catch {
      // A malformed fragment still opens the page normally.
    }
    const headerHeight = document.querySelector(".echo-nav__bar")?.getBoundingClientRect().height || 60;
    const sectionOffset = target ? parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0 : 0;
    const destination = target ? Math.max(0, target.getBoundingClientRect().top + window.scrollY - Math.max(headerHeight + 16, sectionOffset)) : 0;
    window.scrollTo(0, destination);
    const lenis = (window as LenisWindow).__lenis;
    if (lenis) {
      lenis.scrollTo(destination, { immediate: true, force: true });
    }
    ScrollTrigger.refresh();
  }, [pathname]);

  return <>{children}</>;
}
