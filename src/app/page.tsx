import Image from "next/image";
import { HeroStage } from "@/components/hero-stage";
import {
  MotionGlyph,
  type MotionGlyphVariant,
} from "@/components/circular-systems-showcase";

type ServiceRail = {
  title: string;
  angle: string;
  detail: string;
  impact: string;
  cta: string;
};

type ProjectBand = {
  name: string;
  industry: string;
  challenge: string;
  summary: string;
  timeline: string;
  mediaCaption: string;
  mediaVisual: MotionGlyphVariant;
  outcomes: Array<{ label: string; value: string }>;
};

type PlanTone = "muted" | "base" | "plus" | "priority";

type PlanCell = {
  value: string;
  tone: PlanTone;
};

type PlanRow = {
  label: string;
  essential: PlanCell;
  growth: PlanCell;
  partner: PlanCell;
};

const SERVICE_RAILS: ServiceRail[] = [
  {
    title: "Website Design + Build",
    angle: "Brand-led interface systems",
    detail:
      "From positioning to interaction architecture, we build sites that look premium without losing execution speed.",
    impact: "Avg launch cycle reduced by 38%",
    cta: "See Build Scope",
  },
  {
    title: "Conversion Engineering",
    angle: "Journey and offer optimization",
    detail:
      "We map intent states, tighten copy hierarchy, and orchestrate sections so visitors move naturally into high-intent actions.",
    impact: "Demo and quote requests increased by 2.1x",
    cta: "View Conversion Framework",
  },
  {
    title: "Performance + Technical SEO",
    angle: "Core Web Vitals and indexability",
    detail:
      "We optimize rendering strategy, media delivery, and semantic structure so growth and performance can scale together.",
    impact: "Median Lighthouse gain +24 points",
    cta: "Open Performance Playbook",
  },
  {
    title: "Maintenance Operations",
    angle: "Governance, QA, and release confidence",
    detail:
      "Your team gets structured monthly updates, incident handling, and proactive regression checks with clear ownership.",
    impact: "99.9% tracked deployment reliability",
    cta: "Review Retainer Model",
  },
];

const PROJECT_BANDS: ProjectBand[] = [
  {
    name: "Northline Capital",
    industry: "Finance",
    challenge: "Legacy website had weak trust cues and inconsistent conversion flow.",
    summary:
      "Reframed the offer around investor confidence, rebuilt every decision path, and shipped a lightweight premium UI language.",
    timeline: "7 weeks end-to-end",
    mediaCaption: "Asymmetric strategy page with guided action rails.",
    mediaVisual: "sphere-scan",
    outcomes: [
      { label: "Qualified inquiries", value: "+141%" },
      { label: "LCP", value: "1.8s" },
      { label: "Engagement depth", value: "+62%" },
    ],
  },
  {
    name: "PulseFit Clinics",
    industry: "Healthcare",
    challenge:
      "Users dropped before booking due to fragmented content and poor mobile flow.",
    summary:
      "Built a clearer service architecture, simplified appointment journeys, and introduced credibility layers near every decision point.",
    timeline: "5 weeks core launch",
    mediaCaption: "Mobile-first conversion sequencing with trust anchors.",
    mediaVisual: "interconnecting-waves",
    outcomes: [
      { label: "Bookings", value: "+84%" },
      { label: "CLS", value: "0.02" },
      { label: "Bounce rate", value: "-29%" },
    ],
  },
  {
    name: "VertexForge",
    industry: "SaaS",
    challenge:
      "Strong product, unclear market story. The website looked generic and failed to communicate technical depth.",
    summary:
      "Rebuilt the narrative with proof-led modules, technical capability seams, and bespoke interaction choreography.",
    timeline: "6 weeks to launch",
    mediaCaption: "Product narrative bands with live operational metrics.",
    mediaVisual: "crystalline-cube-refraction",
    outcomes: [
      { label: "Pipeline from site", value: "+2.4x" },
      { label: "INP", value: "132ms" },
      { label: "Sales-call quality", value: "+47%" },
    ],
  },
];

const PROCESS_STEPS = [
  {
    title: "Discovery + Audit",
    detail:
      "Business model, audience intent, current stack constraints, and risk map.",
  },
  {
    title: "UX Direction + Interface System",
    detail:
      "Narrative architecture, conversion hierarchy, and bespoke visual language.",
  },
  {
    title: "Build + QA + Measurement",
    detail:
      "Production implementation, analytics events, performance hardening, and regression checks.",
  },
  {
    title: "Launch + Retainer Operations",
    detail:
      "Continuous optimization, content updates, incident handling, and growth sprints.",
  },
];

const PLAN_ROWS: PlanRow[] = [
  {
    label: "Monthly engineering hours",
    essential: { value: "20 hours", tone: "base" },
    growth: { value: "40 hours", tone: "plus" },
    partner: { value: "Custom", tone: "priority" },
  },
  {
    label: "Response SLA",
    essential: { value: "24 hours", tone: "base" },
    growth: { value: "8 hours", tone: "plus" },
    partner: { value: "2 hours", tone: "priority" },
  },
  {
    label: "Performance reporting",
    essential: { value: "Monthly", tone: "base" },
    growth: { value: "Bi-weekly", tone: "plus" },
    partner: { value: "Weekly", tone: "priority" },
  },
  {
    label: "Conversion optimization",
    essential: { value: "Light", tone: "base" },
    growth: { value: "Active", tone: "plus" },
    partner: { value: "Aggressive", tone: "priority" },
  },
  {
    label: "Dedicated strategy sync",
    essential: { value: "Not Included", tone: "muted" },
    growth: { value: "Included", tone: "plus" },
    partner: { value: "Priority", tone: "priority" },
  },
];

const HEADER_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#process", label: "Process" },
  { href: "#plans", label: "Plans" },
  { href: "#contact", label: "Contact" },
];

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
            Book a Call
          </a>
        </div>
      </header>

      <main>
        <HeroStage />

        <section className="container-shell trust-ribbon" aria-label="Trust metrics">
          <p>Trusted by startups, local leaders, and scaling product teams.</p>
          <div>
            <span>
              <strong>+25</strong> avg Lighthouse gain
            </span>
            <span>
              <strong>30-50%</strong> faster launch cycles
            </span>
            <span>
              <strong>99.9%</strong> release confidence tracking
            </span>
          </div>
        </section>

        <section className="container-shell section-block" id="services">
          <div className="section-heading">
            <p className="section-marker">Service architecture</p>
            <h2>Custom systems, not off-the-shelf website execution.</h2>
          </div>

          <div className="service-rail-stack">
            {SERVICE_RAILS.map((service, index) => (
              <article
                key={service.title}
                className={`service-rail ${index % 2 ? "service-rail-reverse" : ""}`}
              >
                <div>
                  <p className="service-angle">{service.angle}</p>
                  <h3>{service.title}</h3>
                </div>
                <p className="service-detail">{service.detail}</p>
                <div className="service-impact">
                  <p>{service.impact}</p>
                  <a href="#contact">{service.cta}</a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container-shell section-block" id="work">
          <div className="section-heading work-heading">
            <p className="section-marker">Project previews</p>
            <h2>Proof-forward case studies with measurable outcomes.</h2>
          </div>

          <div className="project-stack">
            {PROJECT_BANDS.map((project, index) => (
              <article
                key={project.name}
                className={`project-band ${index % 2 ? "project-band-reverse" : ""}`}
              >
                <div className="project-media chassis-panel">
                  <MotionGlyph className="project-media-glyph" variant={project.mediaVisual} />
                  <p>{project.mediaCaption}</p>
                </div>

                <div className="project-copy">
                  <div className="project-kicker-row">
                    <p>{project.industry}</p>
                    <span>{project.timeline}</span>
                  </div>
                  <h3>{project.name}</h3>
                  <p>{project.challenge}</p>
                  <p>{project.summary}</p>

                  <ul className="project-outcomes">
                    {project.outcomes.map((metric) => (
                      <li key={metric.label} className="metric-chassis">
                        <p>{metric.value}</p>
                        <span>{metric.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="container-shell section-block dual-layout" id="process">
          <div className="section-heading">
            <p className="section-marker">Operating model</p>
            <h2>Structured process with clear accountability from day one.</h2>
          </div>

          <ol className="process-spine">
            {PROCESS_STEPS.map((step, idx) => (
              <li key={step.title}>
                <p>{String(idx + 1).padStart(2, "0")}</p>
                <div>
                  <h3>{step.title}</h3>
                  <span>{step.detail}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="container-shell section-block" id="plans">
          <div className="section-heading">
            <p className="section-marker">Maintenance plans</p>
            <h2>Predictable growth support with clear SLA coverage.</h2>
          </div>

          <div className="plan-matrix-wrap chassis-panel">
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
                  <tr key={row.label}>
                    <td>{row.label}</td>
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

        <section className="container-shell section-block" id="contact">
          <div className="final-cta chassis-panel">
            <p className="section-marker">Ready to build</p>
            <h2>Let echo11 own your web presence end-to-end.</h2>
            <p>
              We design, build, and run your website as a business engine with
              premium execution quality and operational rigor.
            </p>
            <div>
              <a className="action action-primary" href="mailto:hello@echo11.com">
                Start a Conversation
              </a>
              <a className="action action-secondary" href="#work">
                View Case Studies
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
