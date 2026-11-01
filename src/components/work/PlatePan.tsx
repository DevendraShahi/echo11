"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/**
 * Moves a plate's screenshot inside its frame as the frame crosses the viewport,
 * so project media reads as live while it is being scrolled past rather than as a
 * still picture.
 *
 * It pans with a scroll-linked transform rather than a CSS `view()` timeline. A
 * view timeline resolves its scroller from the nearest scroll container, and this
 * site gives `body` `overflow-x: clip`, which makes body a scroll container that
 * never scrolls, so the timeline would measure against it and never advance. This
 * measures against the viewport instead.
 *
 * The frame holds the clip, so a scaled layer can move inside it without changing
 * the plate's geometry, and the scale sits on a different element from the pan so
 * the two transforms cannot overwrite each other.
 *
 * Reduced motion is handled in CSS, by `motion-safe:` on the scale and by
 * `.plate-pan-layer` in the reduced-motion block in `globals.css`. That is
 * deliberate: the motion library caches the user's preference in module state on
 * first call, so a component that starts server-rendered can carry the wrong
 * answer, and a CSS rule also stands the transform down before first paint
 * instead of after hydration.
 */
export function PlatePan({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);

  return (
    <div ref={ref} className="absolute inset-0 motion-safe:scale-[1.12]">
      <motion.div className="plate-pan-layer absolute inset-0" style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}
