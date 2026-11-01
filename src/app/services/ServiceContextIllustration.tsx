"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useInView, useReducedMotion } from "framer-motion";

import { gsap } from "@/lib/gsap";

// Explanatory SVG page systems, not client screenshots or measured results.
// Book of Shapes remains inside the composition as supporting art.
export function ServiceContextIllustration({ index, children, compact }: { index: number; children: ReactNode; compact: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const entered = useInView(svgRef, { once: true, amount: .2 });
  const reduced = useReducedMotion();
  useEffect(() => {
    const svg = svgRef.current;
    if (!entered || reduced || !svg) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { duration: .7, ease: "power3.out" } });
      svg.querySelectorAll<SVGGElement>("[data-context-delay]").forEach(group => {
        timeline.fromTo(group, { attr: { opacity: 0 } }, { attr: { opacity: 1 } }, Number(group.dataset.contextDelay) || 0);
      });
    }, svg);
    return () => context.revert();
  }, [entered, reduced, index, compact]);
  if (compact) {
    return <svg ref={svgRef} viewBox="0 0 120 120" className="h-full w-full" fill="none" stroke="var(--foreground)" strokeWidth="1.5" aria-hidden="true">
      <g data-context-delay={0}><rect x="8" y="20" width="104" height="80" rx="3" /></g>
      <path d="M8 35h104" />
      <circle cx="17" cy="28" r="1" /><circle cx="23" cy="28" r="1" />
      {index === 1 ? <g data-context-delay={.15}><path d="M20 49h47M20 57h31M20 72h80M20 79h63" /><rect x="20" y="87" width="26" height="5" fill="var(--accent)" stroke="none" /><rect x="78" y="47" width="22" height="19" /></g> : <g data-context-delay={.15}><rect x="19" y="45" width="21" height="27" /><rect x="49" y="45" width="21" height="27" /><rect x="79" y="45" width="21" height="27" /><path d="M19 79h21M49 79h21M79 79h21" /><path d="M75 87h25" stroke="var(--accent)" /></g>}
    </svg>;
  }
  return <svg ref={svgRef} viewBox="0 0 560 460" className="h-full w-full" fill="none" aria-hidden="true">
    <rect x="18" y="38" width="524" height="372" rx="4" fill="none" stroke="var(--foreground)" strokeOpacity=".2" />
    <path d="M18 70h524" stroke="var(--foreground)" strokeOpacity=".16" />
    <circle cx="32" cy="54" r="2" fill="var(--muted-foreground)" /><circle cx="41" cy="54" r="2" fill="var(--muted-foreground)" /><circle cx="50" cy="54" r="2" fill="var(--muted-foreground)" />
    <text x="280" y="57" textAnchor="middle" fill="var(--muted-foreground)" fontFamily="monospace" fontSize="9">{index === 1 ? "A clearer website experience" : "A considered shopping experience"}</text>
    {index === 1 ? <>
      <text x="42" y="103" fill="var(--foreground)" fontSize="12" fontWeight="600">Your business</text>
      <text x="332" y="103" fill="var(--muted-foreground)" fontSize="10">Services</text><text x="393" y="103" fill="var(--muted-foreground)" fontSize="10">About</text><text x="448" y="103" fill="var(--accent)" fontSize="10">Contact</text>
      <g data-context-delay={.1}><text x="42" y="155" fill="var(--foreground)" fontSize="28" fontWeight="600">A clear offer.</text>
      <text x="42" y="187" fill="var(--foreground)" fontSize="28" fontWeight="600">An obvious next step.</text>
      <text x="42" y="218" fill="var(--muted-foreground)" fontSize="11">What you do. Who it helps. Why it matters.</text></g>
      <g data-context-delay={.5}><rect x="42" y="238" width="115" height="30" fill="var(--accent)" /><text x="99" y="257" textAnchor="middle" fill="var(--background)" fontSize="10">Make an inquiry ↗</text></g>
      <foreignObject x="365" y="130" width="137" height="142">{children}</foreignObject>
      <path d="M42 291h476" stroke="var(--foreground)" strokeOpacity=".13" />
      {[['Offer','Understand the service'],['Evidence','Find reasons to trust'],['Action','Start a conversation']].map(([title,detail],i)=><g key={title} data-context-delay={.2+i*.1}><text x={42+i*165} y="326" fill="var(--foreground)" fontSize="14">{title}</text><text x={42+i*165} y="347" fill="var(--muted-foreground)" fontSize="9">{detail}</text></g>)}
    </> : <>
      <text x="42" y="103" fill="var(--foreground)" fontSize="12" fontWeight="600">Your store</text><text x="313" y="103" fill="var(--muted-foreground)" fontSize="10">Shop</text><text x="365" y="103" fill="var(--muted-foreground)" fontSize="10">Collections</text><text x="460" y="103" fill="var(--accent)" fontSize="10">Cart (1)</text>
      <text x="42" y="148" fill="var(--foreground)" fontSize="25" fontWeight="600">Find your next favourite.</text>
      {[42,164,286].map((x,i)=><g key={x} data-context-delay={.1+i*.15}><rect x={x} y="176" width="104" height="116" fill="var(--card)" stroke="var(--foreground)" strokeOpacity=".09" />{i===1 ? <g transform={`translate(${x+36} 199)`} stroke="var(--foreground)" strokeWidth="1.5"><path d="M10 0h16v13H10zM7 13h22l5 9v45H2V22zM2 36h32M2 54h32" /></g> : <g transform={`translate(${x+22} 216)`} stroke="var(--foreground)" strokeWidth="1.5"><path d="M0 30h61v12H0zM4 30l7-28 20 14 12 5 18 9M15 10l14 8M13 17l14 8" /></g>}<text x={x} y="311" fill="var(--foreground)" fontSize="10">Product details</text><text x={x} y="328" fill="var(--muted-foreground)" fontSize="9">Explore · Compare</text></g>)}
      <g data-context-delay={.55}><rect x="413" y="176" width="105" height="153" fill="var(--card)" stroke="var(--foreground)" strokeOpacity=".16" /><text x="426" y="199" fill="var(--foreground)" fontSize="12">Your cart</text><path d="M426 212h77M426 241h54" stroke="var(--foreground)" strokeOpacity=".18" /><text x="426" y="231" fill="var(--muted-foreground)" fontSize="9">Chosen product</text><rect x="426" y="274" width="78" height="28" fill="var(--accent)" /><text x="465" y="292" textAnchor="middle" fill="var(--background)" fontSize="10">Checkout ↗</text></g>
      <foreignObject x="430" y="344" width="65" height="54">{children}</foreignObject>
      <text x="42" y="377" fill="var(--muted-foreground)" fontSize="10">Discover the range → Understand the product → Purchase</text>
    </>}
    <text x="280" y="438" textAnchor="middle" fill="var(--muted-foreground)" fontFamily="monospace" fontSize="9">ILLUSTRATIVE PAGE SYSTEM · NOT A CLIENT RESULT</text>
  </svg>;
}
