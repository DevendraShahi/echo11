"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PLATFORM_GRID } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

const CARD_COLORS = [
    { from: "#7c3aed", to: "#4f46e5", spot: "139, 92, 246" },
    { from: "#059669", to: "#0d9488", spot: "5, 150, 105" },
    { from: "#dc2626", to: "#ea580c", spot: "220, 38, 38" },
    { from: "#2563eb", to: "#7c3aed", spot: "37, 99, 235" },
    { from: "#d97706", to: "#dc2626", spot: "217, 119, 6" },
];

function BentoCard({ p, cls, i }: { p: typeof PLATFORM_GRID[0]; cls: string; i: number }) {
    const ref = useRef<HTMLDivElement>(null);
    const rafRef = useRef<number | null>(null);
    const col = CARD_COLORS[i % CARD_COLORS.length]!;

    const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            const el = ref.current; if (!el) return;
            const r = el.getBoundingClientRect();
            const x = ((e.clientX - r.left) / r.width) * 100;
            const y = ((e.clientY - r.top) / r.height) * 100;
            const rx = ((e.clientY - r.top - r.height / 2) / r.height) * -6;
            const ry = ((e.clientX - r.left - r.width / 2) / r.width) * 6;
            el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(4px)`;
            el.style.setProperty("--mx", `${x}%`);
            el.style.setProperty("--my", `${y}%`);
        });
    }, []);

    const onEnter = useCallback(() => {
        const el = ref.current; if (!el) return;
        el.style.willChange = "transform";
    }, []);

    const onLeave = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const el = ref.current; if (!el) return;
        el.style.transform = "";
        el.style.willChange = "auto";
    }, []);

    return (
        <div
            ref={ref}
            className={`bt-card ${cls}`}
            onMouseEnter={onEnter}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            style={{ "--g1": col.from, "--g2": col.to, "--spot": col.spot } as React.CSSProperties}
        >
            <div className="bt-glow" />
            <div className="bt-content">
                <span className="bt-idx">0{i + 1}</span>
                <h3 className="bt-name">{p.name}</h3>
                <p className="bt-sub">{p.subtitle}</p>
                <p className="bt-desc">{p.description}</p>
                <div className="bt-footer">{p.reveal}</div>
            </div>
            <div className="bt-corner-tl" />
            <div className="bt-corner-br" />
        </div>
    );
}

const CLASSES = ["bt-span7 bt-feat", "bt-span5", "bt-span4 bt-tall", "bt-span4", "bt-span4"];

export function PlatformGrid() {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = ref.current; if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(".bt-card",
                { y: 50, opacity: 0, clipPath: "inset(12% 6% 12% 6% round 8px)" },
                {
                    y: 0, opacity: 1, clipPath: "inset(0% 0% 0% 0% round 8px)", duration: 0.8, stagger: 0.1, ease: "power3.out",
                    scrollTrigger: { trigger: el, start: "top 78%", once: true }
                }
            );
        }, el);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={ref} className="bt-section container-shell" id="platforms">
            <div className="bt-header">
                <div className="bt-tag">Platform Ecosystem</div>
                <h2 className="bt-title">Our product<br /><em>network</em></h2>
            </div>
            <div className="bt-grid">
                {PLATFORM_GRID.map((p, i) => (
                    <BentoCard key={p.name} p={p} cls={CLASSES[i] ?? "bt-span4"} i={i} />
                ))}
            </div>
        </section>
    );
}
