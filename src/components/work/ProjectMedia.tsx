"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import type { CaseStudy } from "@/data/caseStudies";
import { cn } from "@/lib/utils";
import { PlatePan } from "./PlatePan";

/**
 * The `/work` gallery treatment. Increasing the scale on hover has been this
 * page's behaviour since before Home had plates, and it is otherwise left
 * exactly as it was found. Only the transform is gated: under
 * `prefers-reduced-motion` the plate must not move on hover either.
 */
const GALLERY_MEDIA =
  "object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:scale-[1.025] motion-safe:group-focus-visible:scale-[1.025]";

/**
 * The Home feature treatment. A composed response rather than a bare scale: the
 * capture lifts and gains a little brightness and saturation, so hovering makes
 * the product easier to read instead of only larger. 700ms, so it answers the
 * pointer rather than lagging behind it, and every part of it behind
 * `motion-safe:` so nothing moves for anyone who has asked for reduced motion.
 *
 * The lift is a percentage because a percentage is measured against the image's
 * own height: the scale gives back 3% of that height in overflow on each edge, so
 * a 2% lift cannot pull an edge clear of the frame at any viewport, which a fixed
 * pixel value would at the narrow end. The promotion hint is scoped to the hover
 * state, so no layer sits promoted while the plate is at rest.
 */
const FEATURE_MEDIA =
  "object-cover object-top transition-[transform,filter] duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] motion-safe:group-hover:-translate-y-[2%] motion-safe:group-hover:scale-[1.06] motion-safe:group-hover:brightness-[1.06] motion-safe:group-hover:saturate-[1.08] motion-safe:group-hover:will-change-transform";

/**
 * Which surface a plate is standing on. Named rather than a boolean so a caller
 * has to say which surface it is, and so a third surface has to be added
 * deliberately instead of inheriting a treatment by omission.
 */
export type PlateSurface = "gallery" | "feature";

const SURFACE: Record<
  PlateSurface,
  { media: string; waitingSurface: boolean; pan: boolean }
> = {
  gallery: { media: GALLERY_MEDIA, waitingSurface: true, pan: false },
  feature: { media: FEATURE_MEDIA, waitingSurface: true, pan: true },
};

/**
 * The surface a plate waits on, derived from the project's own brand colour and
 * darkened so it reads as a ground rather than as a graphic of its own. Without
 * it a light screenshot appears out of a near-black void.
 *
 * The feature surface also pans. Its screenshot sits in a `PlatePan` layer inside
 * the frame, so the frame keeps the clip and the plate's geometry, the pan and the
 * hover scale stay independent transforms, and the gallery surface renders the
 * image directly, exactly as it always has.
 *
 * Painted on the frame rather than handed to the image as a blur placeholder: a
 * solid colour is guaranteed to paint, and the placeholder route left the frame
 * black in the browser even with the background style applied.
 */
function tint(color: string) {
  const value = parseInt(color.replace("#", ""), 16);
  const channel = (shift: number) => Math.round((((value >> shift) & 255) * 0.42));
  return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`;
}

/**
 * The shared project plate: one screenshot of a build inside a fixed-ratio
 * frame. Every thumbnail in `public/work` was captured at 7:4 (a full desktop
 * fold), so the ratio passed in decides how much of that capture survives. Pass
 * 7:4 to show the whole thing uncropped.
 */
export function ProjectMedia({
  project,
  sizes,
  priority,
  ratio,
  alt,
  surface,
  revealOnLoad = false,
  entrance,
  entranceDelay = 0,
  animateEntrance = true,
}: {
  project: CaseStudy;
  sizes: string;
  priority?: boolean;
  ratio: string;
  /**
   * What the picture is. Required, so each caller has to decide what it claims
   * about the site instead of inheriting a wording that may not be true.
   */
  alt: string;
  /** Which surface's media treatment and load state this plate renders in. */
  surface: PlateSurface;
  revealOnLoad?: boolean;
  entrance?: "up" | "left" | "right";
  entranceDelay?: number;
  animateEntrance?: boolean;
}) {
  const { media, waitingSurface, pan } = SURFACE[surface];
  const reduce = useReducedMotion();

  const screenshot = (
    <Image
      src={project.thumbnail}
      alt={project.id === "green" ? "Editorial sustainability photograph illustrating the Green Lifestyle project" : alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn(media, revealOnLoad && "motion-safe:animate-[work-image-in_700ms_ease-out_both]")}
    />
  );

  return (
    <motion.div
      initial={surface === "gallery" && !reduce && animateEntrance ? {
        opacity: 0.5,
        x: entrance === "left" ? -28 : entrance === "right" ? 28 : 0,
        y: entrance ? 36 : 0,
        scale: entrance ? 0.98 : 1,
        clipPath: "inset(3% 0 3% 0)",
      } : false}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, clipPath: "inset(0% 0 0% 0)" }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: reduce ? 0 : 0.95, delay: reduce ? 0 : entranceDelay, ease: [0.16, 1, 0.3, 1] }}
      className={cn("relative w-full overflow-hidden bg-white/[0.02] motion-reduce:!transform-none motion-reduce:!opacity-100 motion-reduce:![clip-path:none]", ratio)}
      style={waitingSurface ? { backgroundColor: tint(project.color) } : undefined}
    >
      {pan ? <PlatePan>{screenshot}</PlatePan> : screenshot}
      {surface === "gallery" && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 border border-white/10 transition-colors duration-500 group-hover:border-accent/40 group-focus-visible:border-accent/60" />
      )}
    </motion.div>
  );
}
