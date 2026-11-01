"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Container } from "@/components/ui/Container";

const EASE = [0.16, 1, 0.3, 1] as const;

type Mark =
  | {
      name: string;
      kind: "image";
      src: string;
      width: number;
      height: number;
      /**
       * Box height relative to the row. Marks whose artwork carries a
       * full-bleed frame scale up so every mark reads at the same optical
       * weight.
       */
      heightClass: string;
      unoptimized?: boolean;
    }
  | { name: string; kind: "text"; provenance: "client" | "concept" };

/**
 * Selected client work and Echo11-owned concepts. Client marks bring their
 * own artwork; concepts are set in type so their treatment stays intentionally
 * separate from a client endorsement.
 */
const MARKS: Mark[] = [
  { name: "The Leaders", kind: "image", src: "/clients/leaders.svg", width: 932, height: 569, heightClass: "h-full", unoptimized: true },
  { name: "Green Lifestyle", kind: "image", src: "/clients/greenlifestyle-mark.png", width: 1024, height: 1024, heightClass: "h-[145%]" },
  { name: "TrueLuxe", kind: "text", provenance: "client" },
  { name: "Siyo Dhaago", kind: "text", provenance: "concept" },
  { name: "Ivision", kind: "text", provenance: "concept" },
  { name: "Fluids", kind: "text", provenance: "concept" },
  { name: "CurriculumOS", kind: "text", provenance: "client" },
];

export function ClientLogos() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="Client work and labeled studio concepts"
      className="border-y border-white/[0.08] py-12 md:py-16"
    >
      <Container>
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-white/40"
        >
          Client work and studio concepts
        </motion.p>

        <ul className="mt-9 flex flex-wrap items-center justify-center gap-x-10 gap-y-7 md:mt-11 md:gap-x-14 lg:gap-x-16">
          {MARKS.map((mark, index) => (
            <motion.li
              key={mark.name}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: EASE, delay: 0.1 + index * 0.06 }}
              className="group flex h-11 items-center md:h-12"
            >
              {mark.kind === "image" ? (
                /* The file describes the picture; `alt` names the work. */
                <Image
                  src={mark.src}
                  alt={`${mark.name} — client work`}
                  width={mark.width}
                  height={mark.height}
                  unoptimized={mark.unoptimized}
                  className={`${mark.heightClass} w-auto max-w-[160px] object-contain opacity-55 brightness-0 invert transition-opacity duration-500 group-hover:opacity-95`}
                />
              ) : (
                <span className="font-sans text-[15px] font-bold tracking-[-0.02em] text-white/50 transition-colors duration-500 group-hover:text-white/90 md:text-[17px]">
                  {mark.name} · {mark.provenance === "concept" ? "Concept" : "Client"}
                </span>
              )}
            </motion.li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
