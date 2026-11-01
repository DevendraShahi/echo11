"use client";

import { createElement, memo, useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

import { gsap } from "@/lib/gsap";

import artwork from "./artwork.json";
import { ServiceContextIllustration } from "./ServiceContextIllustration";

// Book of Shapes geometry (cross, flow, commerce, phyllotaxis-bloom);
// see public/images/services/README.md.
// Motion acts on the exported geometry, without additional decorative elements.
const works = [
  { file: "cross", title: "Your business, ready to be discovered", detail: "A clear website connects your offer with the people looking for it.", stages: ["Business", "Identity", "Website"] },
  { file: "flow", title: "From a crowded site to a clear next step", detail: "Bring content, navigation, and customer intent into alignment.", stages: ["Interest", "Clarity", "Inquiry"] },
  { file: "commerce", title: "A catalogue that connects", detail: "Products, categories, and checkout form a connected shopping experience.", stages: ["Discover", "Choose", "Purchase"] },
  { file: "phyllotaxis", title: "A foundation for what comes next", detail: "A consistent page system and a clear handover make future content and new pages easier to manage.", stages: ["Launch", "Ownership", "Evolution"] },
];

export function ServiceArtwork({ index, compact = false, animateCompact = false, glow = false }: { index: number; compact?: boolean; animateCompact?: boolean; glow?: boolean }) {
  const reduced = useReducedMotion();
  const work = works[index];
  const staticGeometry = Boolean(reduced) || (compact && !animateCompact);
  return <figure
    className={compact ? "relative" : "relative min-w-0 border-y border-border py-6"}>
    {glow && <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.08),transparent_65%)]" />}
    {!compact && <p className="font-mono text-[10px] uppercase tracking-[.18em] text-white/50">{work.title}</p>}
    <div aria-hidden="true" className={`relative isolate overflow-hidden ${compact ? "aspect-square" : "aspect-[6/5]"}`}>
      <div className="absolute inset-[8%]">
        {index === 0 || index === 3 ? <ShapeGeometry name={work.file as keyof typeof artwork} reduced={staticGeometry} /> : <ServiceContextIllustration index={index} compact={compact}><ShapeGeometry name={work.file as keyof typeof artwork} reduced={staticGeometry} /></ServiceContextIllustration>}
      </div>
    </div>
    {!compact && <figcaption><div className="flex justify-between gap-2 font-mono text-[10px] uppercase tracking-wider text-white/75">{work.stages.map(stage=><span key={stage}>{stage}</span>)}</div><p className="mt-4 max-w-[40ch] text-sm leading-6 text-white/60">{work.detail}</p></figcaption>}
  </figure>;
}

interface ShapeNode {
  tag: string;
  attrs: Record<string, string>;
  children: ShapeNode[];
}

// Render complete source geometry first. GSAP animates SVG attributes without
// the native SMIL startup API, which can throw NS_ERROR_FAILURE in Firefox.
const ShapeGeometry = memo(function ShapeGeometry({ name, reduced }: { name: keyof typeof artwork; reduced: boolean }) {
  const root = artwork[name] as unknown as ShapeNode;
  const svgRef = useRef<SVGSVGElement>(null);
  const entered = useInView(svgRef, { once: true, amount: .2 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!entered || reduced || !svg) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { duration: 1.25, ease: "power3.out" } });
      if (name === "cross") {
        svg.querySelectorAll<SVGGElement>("[data-shape-motion='cross']").forEach(group => {
          const transform = group.getAttribute("transform") || "";
          const translation = transform.match(/translate\(([-\d.]+),?\s+([-\d.]+)\)/);
          if (!translation) return;
          const x = Number(translation[1]), y = Number(translation[2]);
          const from = transform.replace(translation[0], `translate(${x * 1.16} ${-134.8 + (y + 134.8) * 1.16})`);
          timeline.fromTo(group, { attr: { transform: from } }, { attr: { transform } }, 0);
        });
      } else if (name === "flow") {
        timeline.fromTo(svg.querySelectorAll("path"),
          { attr: { pathLength: 1, "stroke-dasharray": 1, "stroke-dashoffset": 1 } },
          { attr: { "stroke-dashoffset": 0 } }, 0);
      } else if (name === "commerce") {
        svg.querySelectorAll<SVGPolygonElement>("polygon").forEach(polygon => {
          const points = polygon.getAttribute("points") || "";
          const coordinates = points.trim().split(/\s+/).map(point => point.split(",").map(Number));
          if (!coordinates.length || coordinates.some(point => point.length !== 2 || point.some(value => !Number.isFinite(value)))) return;
          const cx = coordinates.reduce((sum, point) => sum + point[0], 0) / coordinates.length;
          const cy = coordinates.reduce((sum, point) => sum + point[1], 0) / coordinates.length;
          const from = coordinates.map(([x, y]) => `${cx + (x - cx) * .65},${cy + (y - cy) * .65}`).join(" ");
          timeline.fromTo(polygon, { attr: { points: from } }, { attr: { points } }, 0);
        });
      } else if (name === "phyllotaxis") {
        const lines = Array.from(svg.querySelectorAll<SVGLineElement>("line"));
        const maxTick = Math.max(1, ...lines.map(line => Number(line.getAttribute("x2")) || 0));
        lines.forEach(line => {
          const x2 = Number(line.getAttribute("x2")) || 0;
          const delay = Math.round(x2 / maxTick * 45) / 100;
          timeline.fromTo(line, { attr: { x2: 0 } }, { attr: { x2 } }, delay);
          const group = line.parentElement;
          const transform = group?.getAttribute("transform") || "";
          const rotation = transform.match(/rotate\(([-\d.]+)\)/);
          if (group && rotation) {
            const from = transform.replace(rotation[0], `rotate(${Number(rotation[1]) - 24})`);
            timeline.fromTo(group, { attr: { transform: from } }, { attr: { transform } }, delay);
          }
        });
      }
    }, svg);
    // Route changes, Strict Mode and reduced-motion changes restore every
    // original attribute and stop the old timeline before a new one starts.
    return () => context.revert();
  }, [entered, reduced, name]);

  function render(node: ShapeNode, key: string): React.ReactNode {
    const attrs = node.attrs;
    const motionTarget = name === "cross" && node.tag === "g" && attrs.transform?.includes("scale(1") ? "cross" : undefined;
    return createElement(node.tag, { ...attrs, key, "data-shape-motion": motionTarget }, node.children.map((child, index) => render(child, `${key}-${index}`)));
  }
  return <svg ref={svgRef} aria-hidden="true" viewBox={root.attrs.viewBox} className="h-full w-full overflow-visible" fill="none">{root.children.map((child, index) => render(child, String(index)))}</svg>;
});
