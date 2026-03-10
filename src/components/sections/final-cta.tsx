"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TRUST_METRICS } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";

gsap.registerPlugin(ScrollTrigger);

export function FinalCta() {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = ref.current; if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(".fc-metric", { y: 24, opacity: 0, scale: 0.94 },
                {
                    y: 0, opacity: 1, scale: 1, duration: 0.65, stagger: 0.12, ease: "back.out(1.5)",
                    scrollTrigger: { trigger: el, start: "top 78%", once: true }
                }
            );
        }, el);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={ref} className="fc-section" id="contact" aria-labelledby="fc-headline">
            <div className="fc-mesh" aria-hidden="true" />
            <div className="fc-grid-dots" aria-hidden="true" />

            <div className="container-shell fc-shell">
                <div className="fc-content">
                    <span className="fc-kicker">Ready when you are</span>
                    <h2 className="fc-headline" id="fc-headline">
                        Let&apos;s build something<br /><em>worth remembering.</em>
                    </h2>
                    <p className="fc-body">
                        Your fractional architecture team — narrative, performance, and operations in one disciplined workflow.
                    </p>
                    <div className="fc-actions">
                        <a className="fc-btn-primary" href="mailto:hello@echo11.com"
                            onClick={() => trackEvent("cta_click", { cta_id: "final_primary", position: "footer_cta" })}>
                            <span>Book a Strategy Call</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="fc-btn-glow" />
                        </a>
                        <Link className="fc-btn-secondary" href="/work"
                            onClick={() => trackEvent("cta_click", { cta_id: "final_secondary", position: "footer_cta" })}>
                            See our work
                        </Link>
                    </div>
                </div>

                <div className="fc-metrics">
                    {TRUST_METRICS.map(m => (
                        <div key={m.label} className="fc-metric">
                            <span className="fc-metric-val">{m.value}</span>
                            <span className="fc-metric-label">{m.label}</span>
                            <span className="fc-metric-note">{m.detail}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
