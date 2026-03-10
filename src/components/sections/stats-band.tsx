"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TRUST_METRICS } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

function parseValue(val: string) {
    const m = val.match(/^([+\-<> ]*)(\d+\.?\d*)(.*)$/);
    if (!m) return { prefix: "", num: 0, suffix: val };
    return { prefix: m[1] ?? "", num: parseFloat(m[2]), suffix: m[3] ?? "" };
}

export function StatsBand() {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(".sb-card", { y: 40, opacity: 0 }, {
                y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
            });
            el.querySelectorAll<HTMLElement>("[data-count]").forEach((node) => {
                const { prefix, num, suffix } = parseValue(node.dataset.count ?? "0");
                const obj = { v: 0 };
                gsap.to(obj, {
                    v: num, duration: 2, ease: "power2.out",
                    scrollTrigger: { trigger: node, start: "top 88%", once: true },
                    onUpdate: () => { node.textContent = prefix + (Number.isInteger(num) ? Math.round(obj.v) : obj.v.toFixed(1)) + suffix; },
                    onComplete: () => { node.textContent = prefix + (Number.isInteger(num) ? Math.round(num) : num.toFixed(1)) + suffix; },
                });
            });
        }, el);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={ref} className="sb-section">
            <div className="container-shell sb-grid">
                {TRUST_METRICS.map((m, i) => {
                    const { prefix, num, suffix } = parseValue(m.value);
                    return (
                        <div key={m.label} className="sb-card">
                            <div className="sb-card-orb" style={{ "--orb-i": i } as React.CSSProperties} />
                            <span className="sb-num" data-count={m.value}>{prefix}{num}{suffix}</span>
                            <span className="sb-label">{m.label}</span>
                            <span className="sb-detail">{m.detail}</span>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
