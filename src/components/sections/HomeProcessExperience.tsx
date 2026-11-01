"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";

const stages = [
  { id: "discovery", name: "Discovery", purpose: "Agree the direction.", image: "iso-cross.svg" },
  { id: "design", name: "Design", purpose: "Approve the experience.", image: "flow.svg" },
  { id: "build", name: "Build", purpose: "Review the working website.", image: "commerce.svg" },
  { id: "launch", name: "Launch", purpose: "Go live, ready to take over.", image: "phyllotaxis-bloom.svg" },
];

export function HomeProcessExperience() {
  return <section id="process" aria-labelledby="home-process-heading" className="scroll-mt-24 py-20 md:py-28"><Container>
    <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-20">
      <div><p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">How we work</p><h2 id="home-process-heading" className="mt-5 max-w-[19ch] font-sans text-[clamp(2.2rem,4.4vw,3.4rem)] font-bold leading-[1.06] tracking-[-0.04em]">Know what happens next.</h2></div>
      <p className="max-w-[45ch] text-base leading-7 text-white/65">Four shared checkpoints from the first conversation to a live website. Explore the full process for deliverables, your input, and the handover.</p>
    </div>
    <ol className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 sm:mt-14 lg:grid-cols-4 lg:gap-8">{stages.map((stage, index) => <li key={stage.id} className="border-t border-white/15"><Link href={`/process#${stage.id}`} className="group block py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"><div className="flex items-center justify-between gap-4"><Image src={`/images/services/${stage.image}`} alt="" width={48} height={48} className="h-12 w-12 object-contain" /><span className="font-mono text-[10px] text-white/45">0{index + 1}</span></div><h3 className="mt-5 text-xl font-semibold group-hover:text-accent">{stage.name}</h3><p className="mt-2 text-sm leading-6 text-white/60">{stage.purpose}</p></Link></li>)}</ol>
    <Link href="/process" className="mt-6 inline-flex min-h-11 items-center gap-3 text-sm text-white/80 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Explore the delivery process<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link>
  </Container></section>;
}
