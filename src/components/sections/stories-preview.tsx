import Link from "next/link";
import { STORIES } from "@/lib/content";

const CAT = {
    build: { label: "Build", bg: "rgba(124,58,237,0.15)", border: "rgba(124,58,237,0.4)", color: "#a78bfa" },
    growth: { label: "Growth", bg: "rgba(5,150,105,0.15)", border: "rgba(5,150,105,0.4)", color: "#34d399" },
    brand: { label: "Brand", bg: "rgba(234,88,12,0.15)", border: "rgba(234,88,12,0.4)", color: "#fb923c" },
};

export function StoriesPreview() {
    return (
        <section className="sp-section container-shell" id="stories-preview">
            <div className="sp-header" data-reveal="fade">
                <div className="sp-tag">Stories</div>
                <h2 className="sp-title">From the<br /><em>case files</em></h2>
            </div>

            <div className="sp-grid">
                {STORIES.slice(0, 3).map((s, i) => {
                    const c = CAT[s.category as keyof typeof CAT] ?? CAT.build;
                    return (
                        <article key={s.slug} className={`sp-card${i === 0 ? " sp-card-wide" : ""}`} data-reveal="clip">
                            <div className="sp-card-bg" />
                            <div className="sp-card-body">
                                <div className="sp-card-top">
                                    <span className="sp-cat" style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}>{c.label}</span>
                                    <span className="sp-time">{s.readTime}</span>
                                </div>
                                <h3 className="sp-card-title">{s.title}</h3>
                                <p className="sp-card-excerpt">{s.excerpt}</p>
                                <div className="sp-card-foot">
                                    <span className="sp-date">{s.publishedOn}</span>
                                    <Link href={`/stories/${s.slug}`} className="sp-link">
                                        Read →
                                    </Link>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
