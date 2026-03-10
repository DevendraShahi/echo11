import Link from "next/link";
import { PROJECTS } from "@/lib/content";

const RESULT_COLORS = ["#a78bfa", "#34d399", "#fb923c"];

export function WorkPreview() {
    return (
        <section className="wp-section container-shell" id="work-preview">
            <div className="wp-header" data-reveal="fade">
                <div className="wp-tag">Work</div>
                <h2 className="wp-title">Results that<br /><em>speak first</em></h2>
            </div>

            <div className="wp-grid">
                {PROJECTS.slice(0, 3).map((p, i) => (
                    <article key={p.slug} className={`wp-card${i === 1 ? " wp-card-accent" : ""}`} data-reveal="clip">
                        <div className="wp-card-top">
                            <span className="wp-industry">{p.industry}</span>
                            <div className="wp-pills">
                                {p.stack.slice(0, 3).map((t) => (
                                    <span key={t} className="wp-pill">{t}</span>
                                ))}
                            </div>
                        </div>
                        <h3 className="wp-name">{p.name}</h3>
                        <p className="wp-overview">{p.overview}</p>
                        <div className="wp-result-box" style={{ "--rc": RESULT_COLORS[i] } as React.CSSProperties}>
                            <span className="wp-result-val">{p.result}</span>
                        </div>
                        <Link href={`/work/${p.slug}`} className="wp-link">
                            <span>Open case study</span>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </Link>
                        <div className="wp-hover-sheet" aria-hidden="true"><span>View Case →</span></div>
                    </article>
                ))}
            </div>
        </section>
    );
}
