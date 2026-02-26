import Image from "next/image";
import { HeroStage } from "@/components/hero-stage";
import { ScrollAmbientBackground } from "@/components/scroll-ambient-background";
import {
  MotionGlyph,
  type MotionGlyphVariant,
} from "@/components/circular-systems-showcase";

type ServiceRail = {
  id: string;
  title: string;
  focus: string;
  detail: string;
  metric: string;
  stack: string;
};

type ProjectBand = {
  name: string;
  industry: string;
  challenge: string;
  summary: string;
  mediaCaption: string;
  mediaVisual: MotionGlyphVariant;
  outcomes: Array<{ label: string; value: string }>;
};

type ProcessStep = {
  id: string;
  title: string;
  detail: string;
  deliverables: [string, string, string];
  clientInput: string;
};

type PlanTone = "muted" | "base" | "plus" | "priority";

type PlanCell = {
  value: string;
  tone: PlanTone;
};

type PlanRow = {
  capability: string;
  essential: PlanCell;
  growth: PlanCell;
  partner: PlanCell;
};

type TrustMetric = {
  value: string;
  label: string;
};

type Testimonial = {
  quote: string;
  client: string;
  role: string;
  outcome: string;
};

type FaqRail = {
  question: string;
  answer: string;
};

const HEADER_LINKS = [
  { href: "#services", label: "Capabilities" },
  { href: "#work", label: "Work" },
  { href: "#process", label: "Process" },
  { href: "#plans", label: "Plans" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

const TRUST_METRICS: TrustMetric[] = [
  {
    value: "+25",
    label: "pts avg. Lighthouse score",
  },
  {
    value: "30-50%",
    label: "faster launch cycles",
  },
  {
    value: "Long-term",
    label: "maintenance SLAs",
  },
];

const SERVICE_RAILS: ServiceRail[] = [
  {
    id: "01",
    title: "Website Design & Build",
    focus: "Positioning-led interface architecture",
    detail:
      "We translate market positioning into a clear conversion journey, then build a premium front-end system that performs under load.",
    metric: "Avg. launch cycle reduced by 38%",
    stack: "Built on: Next.js + Vercel",
  },
  {
    id: "02",
    title: "Performance & Core Web Vitals",
    focus: "Rendering strategy and performance hardening",
    detail:
      "From streaming strategy to asset discipline, we optimize each layer so speed is visible, measurable, and durable after launch.",
    metric: "Median Lighthouse uplift: +25",
    stack: "Built on: RSC + edge caching",
  },
  {
    id: "03",
    title: "SEO & Content Infrastructure",
    focus: "Indexability, structure, and narrative clarity",
    detail:
      "We design content systems that satisfy both search intent and buying intent, with clean semantic architecture and measurable content paths.",
    metric: "Qualified organic leads increased 2.2x",
    stack: "Built on: schema + editorial rails",
  },
  {
    id: "04",
    title: "Maintenance & Growth Retainer",
    focus: "Operational ownership and release confidence",
    detail:
      "We run ongoing releases, regression checks, and optimization cycles so your team ships faster without inheriting technical debt.",
    metric: "99.9% tracked deployment reliability",
    stack: "Built on: SLA governance + QA loops",
  },
];

const PROJECT_BANDS: ProjectBand[] = [
  {
    name: "Northline Capital",
    industry: "Finance",
    challenge:
      "Legacy site lacked confidence markers and underperformed in high-intent inquiry flows.",
    summary:
      "We rebuilt the narrative around decision trust, added proof-led modules, and hardened performance for investor-facing journeys.",
    mediaCaption: "Sphere-scan signal grid for trust-critical pages.",
    mediaVisual: "sphere-scan",
    outcomes: [
      { label: "Conversion lift", value: "+34%" },
      { label: "Load time delta", value: "-2.1s" },
      { label: "Qualified inquiries", value: "+141%" },
    ],
  },
  {
    name: "PulseFit Clinics",
    industry: "Healthcare",
    challenge:
      "Mobile booking drop-off was high due to fragmented content hierarchy.",
    summary:
      "We shipped a mobile-first architecture with trust rails near every decision step and tuned the booking funnel for intent continuity.",
    mediaCaption: "Interconnecting wave visual for patient flow logic.",
    mediaVisual: "interconnecting-waves",
    outcomes: [
      { label: "Booking completion", value: "+84%" },
      { label: "CLS", value: "0.01" },
      { label: "Bounce reduction", value: "-29%" },
    ],
  },
  {
    name: "VertexForge Cloud",
    industry: "SaaS",
    challenge:
      "Product depth existed, but the web narrative looked generic and failed to signal technical authority.",
    summary:
      "We implemented a full-bleed proof system, capability rails, and metric-led messaging calibrated to enterprise buying committees.",
    mediaCaption: "Crystalline breakout panel for platform positioning.",
    mediaVisual: "crystalline-cube-refraction",
    outcomes: [
      { label: "Pipeline from site", value: "+2.4x" },
      { label: "INP", value: "138ms" },
      { label: "Sales-cycle speed", value: "+33%" },
    ],
  },
];

const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "01",
    title: "Discovery & Audit",
    detail:
      "We baseline your commercial model, audience intent, and technical constraints before any interface decisions.",
    deliverables: [
      "Opportunity map",
      "Risk ledger",
      "Architecture thesis",
    ],
    clientInput: "Business goals, ICP, current analytics",
  },
  {
    id: "02",
    title: "UX/UI Direction",
    detail:
      "We define the conversion narrative, component language, and asymmetric layout system before implementation.",
    deliverables: [
      "Information hierarchy",
      "Interaction spec",
      "Design system rails",
    ],
    clientInput: "Brand constraints, stakeholder approval",
  },
  {
    id: "03",
    title: "Build & QA",
    detail:
      "We implement in production-grade Next.js, instrument events, and verify every interface seam across breakpoints.",
    deliverables: ["Code implementation", "Event schema", "Regression suite"],
    clientInput: "Content handoff, staging review",
  },
  {
    id: "04",
    title: "Launch & Optimize",
    detail:
      "After release, we run continuous performance and conversion sprints with measurable operational reporting.",
    deliverables: ["Launch protocol", "SLA routing", "Growth backlog"],
    clientInput: "Monthly priorities, growth targets",
  },
];

const PLAN_ROWS: PlanRow[] = [
  {
    capability: "Response SLA",
    essential: { value: "72h", tone: "base" },
    growth: { value: "24h", tone: "plus" },
    partner: { value: "4h ★", tone: "priority" },
  },
  {
    capability: "Updates / month",
    essential: { value: "2", tone: "base" },
    growth: { value: "6", tone: "plus" },
    partner: { value: "Unlimited", tone: "priority" },
  },
  {
    capability: "Reporting",
    essential: { value: "—", tone: "muted" },
    growth: { value: "Monthly", tone: "plus" },
    partner: { value: "Weekly", tone: "priority" },
  },
  {
    capability: "A/B tests",
    essential: { value: "—", tone: "muted" },
    growth: { value: "Included", tone: "plus" },
    partner: { value: "Included", tone: "priority" },
  },
  {
    capability: "CWV monitoring",
    essential: { value: "—", tone: "muted" },
    growth: { value: "—", tone: "muted" },
    partner: { value: "Included", tone: "priority" },
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Echo11 replaced a slow, generic site with a performance-first platform that finally matched our enterprise product maturity.",
    client: "Anish Rajbhandari",
    role: "COO, VertexForge",
    outcome: "Outcome: +2.4x pipeline contribution from web",
  },
  {
    quote:
      "The conversion architecture changed how prospects engage. We stopped leaking intent and started closing higher-quality inbound opportunities.",
    client: "Maya Shrestha",
    role: "Head of Growth, Northline Capital",
    outcome: "Outcome: +141% qualified inquiries in 90 days",
  },
  {
    quote:
      "Their retainer model feels like an embedded engineering pod. We launch faster, and every release ships with operational confidence.",
    client: "Ritvik Khadka",
    role: "Founder, PulseFit Clinics",
    outcome: "Outcome: 30-50% faster iteration cycles",
  },
];

const FAQ_RAILS: FaqRail[] = [
  {
    question: "How quickly can Echo11 scope and start a project?",
    answer:
      "Most projects are scoped in one strategy call. Discovery starts within 3-5 business days once the scope and operating model are approved.",
  },
  {
    question: "Do you only work on redesigns, or can you own ongoing maintenance too?",
    answer:
      "We do both. Echo11 can deliver net-new builds, strategic redesigns, and ongoing maintenance retainers with response-time SLAs.",
  },
  {
    question: "Can you work with our existing stack and internal team?",
    answer:
      "Yes. We commonly integrate with existing analytics, CMS, and internal engineering processes while owning interface architecture and release quality.",
  },
  {
    question: "What makes this different from a standard agency engagement?",
    answer:
      "Our model is technical luxury: measurable performance targets, conversion-first UX architecture, and operational ownership beyond launch.",
  },
];

const CTA_STACK = ["Next.js", "Vercel", "GSAP", "Three.js"];

function PlanSignal({ cell }: { cell: PlanCell }) {
  return (
    <span className={`plan-signal plan-signal-${cell.tone}`}>
      <span className="plan-signal-glyph" aria-hidden="true" />
      <span>{cell.value}</span>
    </span>
  );
}

export default function Home() {
  return (
    <div className="page-shell">
      <ScrollAmbientBackground />

      <header className="site-header">
        <div className="container-shell header-inner">
          <a className="brand-mark" href="#top" aria-label="echo11 home">
            <Image
              src="/brand/echo11-logo-white.svg"
              alt="echo11"
              width={118}
              height={34}
              priority
            />
          </a>

          <nav aria-label="Primary" className="header-nav">
            {HEADER_LINKS.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <a className="header-action" href="#contact">
            Initialize Protocol
          </a>
        </div>
      </header>

      <main>
        <HeroStage />

        <section className="trust-ribbon" aria-label="Trust metrics">
          <div className="container-shell trust-ribbon-inner">
            <ul className="trust-ribbon-track">
              {TRUST_METRICS.map((metric) => (
                <li key={metric.label}>
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="container-shell section-block" id="services">
          <div className="section-heading">
            <p className="section-marker">{"// CAPABILITIES"}</p>
            <h2>What we architect</h2>
          </div>

          <div className="service-rail-stack">
            {SERVICE_RAILS.map((service) => (
              <article key={service.title} className="service-rail">
                <p className="service-index">{service.id}</p>

                <div className="service-main">
                  <h3>{service.title}</h3>
                  <p className="service-focus">{service.focus}</p>
                  <p className="service-detail">{service.detail}</p>
                </div>

                <div className="service-meta">
                  <p>{service.metric}</p>
                  <p>{service.stack}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container-shell section-block" id="work">
          <div className="section-heading">
            <p className="section-marker">{"// SELECTED WORK"}</p>
            <h2>Outcomes, shipped.</h2>
          </div>

          <div className="project-stack">
            {PROJECT_BANDS.map((project, index) => (
              <article
                key={project.name}
                className={`project-band ${index % 2 ? "project-band-reverse" : ""} ${index % 3 === 2 ? "project-band-breakout" : ""
                  }`.trim()}
              >
                <div className="project-media chassis-panel">
                  <MotionGlyph className="project-media-glyph" variant={project.mediaVisual} />
                  <p>{project.mediaCaption}</p>
                </div>

                <div className="project-copy chassis-panel">
                  <p className="project-industry">{project.industry}</p>
                  <h3>{project.name}</h3>
                  <p className="project-challenge">{project.challenge}</p>
                  <p>{project.summary}</p>

                  <ul className="project-outcomes">
                    {project.outcomes.map((metric) => (
                      <li key={metric.label} className="metric-chassis">
                        <p>{metric.value}</p>
                        <span>{metric.label}</span>
                      </li>
                    ))}
                  </ul>

                  <a href="#contact" className="project-link">
                    View Case Study →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container-shell section-block" id="process">
          <div className="section-heading">
            <p className="section-marker">{"// HOW WE OPERATE"}</p>
            <h2>Four phases. Zero surprises.</h2>
          </div>

          <ol className="process-spine">
            {PROCESS_STEPS.map((step, index) => (
              <li
                key={step.id}
                className={`process-step ${index % 2 ? "process-step-left" : "process-step-right"}`}
              >
                <article className="process-panel chassis-panel">
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>

                  <ul className="process-deliverables" aria-label={`${step.title} deliverables`}>
                    {step.deliverables.map((deliverable) => (
                      <li key={deliverable}>{deliverable}</li>
                    ))}
                  </ul>

                  <p className="process-client-input">
                    Client input required: {step.clientInput}
                  </p>
                </article>

                <span className="process-node">{step.id}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="container-shell section-block" id="plans">
          <div className="section-heading">
            <p className="section-marker">{"// MAINTENANCE PLANS"}</p>
            <h2>Own your web infrastructure.</h2>
          </div>

          <div className="plan-matrix-wrap">
            <table className="plan-matrix">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th>Essential</th>
                  <th>Growth</th>
                  <th>Partner</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_ROWS.map((row) => (
                  <tr key={row.capability}>
                    <td>{row.capability}</td>
                    <td>
                      <PlanSignal cell={row.essential} />
                    </td>
                    <td>
                      <PlanSignal cell={row.growth} />
                    </td>
                    <td>
                      <PlanSignal cell={row.partner} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="container-shell section-block" id="testimonials">
          <div className="section-heading">
            <p className="section-marker">{"// CLIENT OUTCOMES"}</p>
            <h2>Proof from teams that run on velocity.</h2>
          </div>

          <div className="testimonial-columns">
            {TESTIMONIALS.map((testimonial) => (
              <article className="testimonial-rail" key={testimonial.client}>
                <p className="testimonial-mark" aria-hidden="true">
                  “
                </p>
                <blockquote>{testimonial.quote}</blockquote>
                <p className="testimonial-client">{testimonial.client}</p>
                <p className="testimonial-role">{testimonial.role}</p>
                <a href="#work" className="testimonial-outcome">
                  {testimonial.outcome}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="container-shell section-block faq-section" id="faq">
          <div className="section-heading section-heading-centered">
            <p className="section-marker">{"// FAQ"}</p>
            <h2>Clarifying the operating model.</h2>
          </div>

          <div className="faq-rails">
            {FAQ_RAILS.map((item, index) => (
              <details className="faq-rail" key={item.question} open={index === 0}>
                <summary>
                  <span>{item.question}</span>
                  <i className="faq-toggle" aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="cta-dock-section" id="contact">
          <div className="container-shell section-block cta-dock chassis-panel">
            <div className="cta-dock-main">
              <p className="section-marker">{"// INITIALIZE"}</p>
              <h2>Let echo11 own your web presence, end-to-end.</h2>
              <p>
                Your fractional architecture partner for conversion, performance,
                and long-term release confidence.
              </p>
              <div className="hero-cta-row">
                <a className="action action-primary" href="mailto:hello@echo11.com">
                  Book Strategy Call →
                </a>
                <a className="action action-secondary" href="#work">
                  Get a Proposal
                </a>
              </div>
            </div>

            <ul className="cta-stack-list" aria-label="Technology stack">
              {CTA_STACK.map((item) => (
                <li key={item}>
                  <span className="cta-stack-dot" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
