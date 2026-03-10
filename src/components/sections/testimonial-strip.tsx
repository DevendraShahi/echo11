import { TESTIMONIALS } from "@/lib/content";

function Initials({ name }: { name: string }) {
    return (
        <span className="tm-avatar" aria-hidden="true">
            {name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
        </span>
    );
}

export function TestimonialStrip() {
    const lead = TESTIMONIALS[0];
    const rest = TESTIMONIALS.slice(1);
    if (!lead) return null;

    return (
        <section className="tm-section container-shell" id="testimonials">
            <div className="tm-header" data-reveal="fade">
                <div className="tm-tag">Client Outcomes</div>
                <h2 className="tm-title">What clients<br /><em>actually say</em></h2>
            </div>

            <div className="tm-layout">
                <article className="tm-lead" data-reveal="clip" aria-label={`Testimonial from ${lead.client}`}>
                    <div className="tm-lead-bg" />
                    <div className="tm-quote-mark">&ldquo;</div>
                    <blockquote className="tm-lead-quote">{lead.quote}</blockquote>
                    <div className="tm-attr">
                        <Initials name={lead.client} />
                        <div>
                            <p className="tm-name">{lead.client}</p>
                            <p className="tm-role">{lead.role}</p>
                        </div>
                        <span className="tm-sector">{lead.sector}</span>
                    </div>
                    <div className="tm-lead-border" />
                </article>

                <div className="tm-stack">
                    {rest.map(t => (
                        <article key={t.client} className="tm-card" data-reveal="clip" aria-label={`Testimonial from ${t.client}`}>
                            <div className="tm-card-quote">&ldquo;</div>
                            <blockquote className="tm-card-text">{t.quote}</blockquote>
                            <div className="tm-attr tm-attr-sm">
                                <Initials name={t.client} />
                                <div>
                                    <p className="tm-name">{t.client}</p>
                                    <p className="tm-role">{t.role}</p>
                                </div>
                                <span className="tm-sector">{t.sector}</span>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
