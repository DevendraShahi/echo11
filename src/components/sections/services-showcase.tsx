"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SERVICE_PANELS } from "@/lib/content";

gsap.registerPlugin(ScrollTrigger);

const PATH_LEN = 302;

export function ServicesShowcase() {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const ctx = gsap.context(() => {
            el.querySelectorAll<HTMLElement>(".svc-item").forEach((item) => {
                if (!prefersReduced) {
                    gsap.fromTo(
                        item,
                        { x: -28, opacity: 0 },
                        {
                            x: 0, opacity: 1, duration: 0.7, ease: "power3.out",
                            scrollTrigger: { trigger: item, start: "top 88%", once: true },
                        }
                    );
                }
            });
        }, el);

        const paths = el.querySelectorAll<SVGPathElement>(".svc-underline-path");
        const delays = [0, 120, 240, 360];

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const path = entry.target as SVGPathElement;
                        const idx = Array.from(paths).indexOf(path);
                        setTimeout(() => path.classList.add("is-drawn"), delays[idx] ?? 0);
                        observer.unobserve(path);
                    }
                });
            },
            { threshold: 0.3, rootMargin: "0px 0px -60px 0px" }
        );

        if (!prefersReduced) {
            paths.forEach((p) => observer.observe(p));
        } else {
            paths.forEach((p) => p.classList.add("is-drawn"));
        }

        return () => {
            ctx.revert();
            observer.disconnect();
        };
    }, []);

    return (
        <section ref={ref} className="svc-section" id="services">
            <div className="container-shell">
                <div className="svc-header">
                    <div className="svc-tag">Services</div>
                    <h2 className="svc-title">What we<br /><em>actually</em> do.</h2>
                    <p className="svc-sub">No retainers for retainer&apos;s sake. Four focused disciplines, executed like surgery.</p>
                </div>

                <div className="svc-list">
                    {SERVICE_PANELS.map((p, i) => (
                        <div key={p.slug} className="svc-item">
                            <div className="svc-item-left">
                                <span className="svc-num">0{i + 1}</span>
                                <div className="svc-vline" />
                            </div>
                            <div className="svc-item-body">
                                <div className="svc-item-top">
                                    <h3 className="svc-item-title">
                                        <span className="svc-title-text">{p.title}</span>
                                        <svg
                                            className="svc-title-svg"
                                            viewBox="0 0 300 12"
                                            preserveAspectRatio="none"
                                            aria-hidden="true"
                                            focusable="false"
                                        >
                                            <path
                                                className="svc-underline-path"
                                                d="M2 8 C 40 3, 80 11, 120 7 S 200 3, 240 8 S 280 11, 298 7"
                                                stroke="currentColor"
                                                strokeWidth="2.2"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={PATH_LEN}
                                                strokeDashoffset={PATH_LEN}
                                            />
                                        </svg>
                                    </h3>
                                    <Link href={`/services/${p.slug}`} className="svc-item-link">
                                        View brief
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                                            <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </Link>
                                </div>
                                <p className="svc-item-desc">{p.summary}</p>
                                <div className="svc-steps">
                                    {p.process.map((step, j) => (
                                        <div key={j} className="svc-step">
                                            <span className="svc-step-n">{j + 1}</span>
                                            <span>{step}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="svc-outcome">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    {p.outcomes}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
