export type NavLink = {
  href: string;
  label: string;
};

export type StatMetric = {
  label: string;
  value: string;
  detail: string;
};

export type ServicePanel = {
  slug: string;
  title: string;
  summary: string;
  outcomes: string;
  process: string[];
};

export type PlatformCard = {
  name: string;
  subtitle: string;
  description: string;
  reveal: string;
};

export type Testimonial = {
  quote: string;
  client: string;
  role: string;
  sector: string;
};

export type StoryItem = {
  slug: string;
  title: string;
  category: "build" | "growth" | "brand";
  excerpt: string;
  readTime: string;
  publishedOn: string;
};

export type ProjectItem = {
  slug: string;
  name: string;
  industry: string;
  overview: string;
  stack: string[];
  result: string;
};

export type PricingPlan = {
  id: "core" | "velocity" | "sovereign";
  name: string;
  monthly: number;
  annual: number;
  lead: string;
  features: string[];
};

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
};

export type ValueRail = {
  title: string;
  description: string;
};

export type LegalSection = {
  id: string;
  title: string;
  body: string[];
};

export const MARKETING_NAV: NavLink[] = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/stories", label: "Stories" },
  { href: "/work", label: "Work" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const LEGAL_NAV: NavLink[] = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/accessibility", label: "Accessibility" },
];

export const HERO_SIGNALS = [
  "Median LCP 1.6s on launch-week routes",
  "INP under 140ms on conversion journeys",
  "96+ Lighthouse performance benchmark",
  "WCAG 2.2 AA on critical user flows",
];

export const HERO_COPY = {
  kicker: "Echo11 Industrial Web Systems",
  headline: "Cinematic web systems engineered for measurable growth.",
  body:
    "We design, build, and run high-performance marketing platforms for teams that need trust, speed, and operational precision in every release.",
  primaryCta: "Book Strategy Session",
};

export const TRUST_METRICS: StatMetric[] = [
  {
    label: "Revenue Pipeline Lift",
    value: "+141%",
    detail: "highest single-case gain after launch",
  },
  {
    label: "Average Launch Cycle",
    value: "6.2 Weeks",
    detail: "from strategy mapping to production deployment",
  },
  {
    label: "Priority SLA Response",
    value: "< 4 Hours",
    detail: "for incidents affecting revenue-critical pages",
  },
];

export const SOCIAL_PROOF = [
  "Northline Capital",
  "PulseFit Clinics",
  "VertexForge",
  "Nexa Counsel",
  "Prime Athletics",
  "Aurora Studio",
  "StudentStack",
  "StepOutInStyle",
  "ExpressSocialNP",
  "3am3d",
];

export const SERVICE_PANELS: ServicePanel[] = [
  {
    slug: "website-architecture",
    title: "Positioning Architecture & Build",
    summary:
      "We map buyer intent, narrative hierarchy, and decision paths into a production-grade interface system.",
    outcomes: "Typical outcome: clearer qualification flow and stronger close-ready inquiries.",
    process: [
      "Message architecture and conversion sequence",
      "Editorial-grade layout system and design tokens",
      "Production Next.js build with QA instrumentation",
    ],
  },
  {
    slug: "performance-engineering",
    title: "Performance Engineering & Stability",
    summary:
      "We harden rendering, script execution, and asset delivery so growth activity does not erode speed.",
    outcomes: "Typical outcome: sub-2s LCP on revenue pages with fewer regressions.",
    process: [
      "Core Web Vitals budget and route-level baseline",
      "Media, script, and caching optimization pass",
      "Release gates with regression telemetry",
    ],
  },
  {
    slug: "storytelling-seo",
    title: "Story Systems & SEO Infrastructure",
    summary:
      "We build structured content systems that satisfy search intent while keeping brand voice and authority sharp.",
    outcomes: "Typical outcome: higher-intent discovery traffic and cleaner funnel qualification.",
    process: [
      "Semantic content architecture and schema strategy",
      "Conversion-aware editorial templates and topic rails",
      "Publishing QA, indexation, and metadata governance",
    ],
  },
  {
    slug: "retainer-ops",
    title: "Retainer Operations & Growth Cadence",
    summary:
      "We operate your roadmap post-launch with SLA-backed support, release orchestration, and experimentation.",
    outcomes: "Typical outcome: faster shipping velocity with fewer production risks.",
    process: [
      "Backlog triage and executive priority routing",
      "Incident response, QA checks, and deploy governance",
      "Experimentation cycles with monthly impact reporting",
    ],
  },
];

export const PLATFORM_GRID: PlatformCard[] = [
  {
    name: "the-leadersnp",
    subtitle: "Editorial authority platform",
    description:
      "Narrative-forward publication system for executive audience growth.",
    reveal: "Reveal: article carousel with priority ranking.",
  },
  {
    name: "studentstack",
    subtitle: "Learning workflow product",
    description:
      "Operational dashboard language optimized for student progression behavior.",
    reveal: "Reveal: interactive skill-map panel.",
  },
  {
    name: "3am3d",
    subtitle: "WebGL resource marketplace",
    description:
      "Product-led catalog for high-intent buyers evaluating technical depth.",
    reveal: "Reveal: rotating viewport preview.",
  },
  {
    name: "StepOutInStyle",
    subtitle: "Commerce acceleration stack",
    description:
      "Conversion-focused product rails with premium fashion storytelling.",
    reveal: "Reveal: quick-add interaction rail.",
  },
  {
    name: "ExpressSocialNP",
    subtitle: "Agency proof system",
    description:
      "Case-study led credibility architecture with service differentiation.",
    reveal: "Reveal: outcomes carousel.",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Echo11 replaced our generic stack with an engineered interface that now carries our enterprise positioning in every interaction.",
    client: "Maya Shrestha",
    role: "Head of Growth, Northline Capital",
    sector: "Finance",
  },
  {
    quote:
      "We stopped leaking intent. Their structure made our message clearer and our booking flow significantly faster on mobile.",
    client: "Ritvik Khadka",
    role: "Founder, PulseFit Clinics",
    sector: "Healthcare",
  },
  {
    quote:
      "Their retainer workflow feels like a focused in-house pod. We ship with confidence because quality checks are systematic.",
    client: "Anish Rajbhandari",
    role: "COO, VertexForge",
    sector: "SaaS",
  },
];

export const STORIES: StoryItem[] = [
  {
    slug: "northline-trust-rebuild",
    title: "How Northline rebuilt investor trust in 7 weeks",
    category: "growth",
    excerpt:
      "A conversion and credibility overhaul that replaced unclear messaging with proof-led decision rails.",
    readTime: "8 min read",
    publishedOn: "January 14, 2026",
  },
  {
    slug: "pulsefit-mobile-booking",
    title: "The mobile booking framework behind PulseFit's +84% lift",
    category: "build",
    excerpt:
      "A structural UX rewrite that aligned content hierarchy with patient intent signals.",
    readTime: "6 min read",
    publishedOn: "December 11, 2025",
  },
  {
    slug: "vertexforge-category-leadership",
    title: "Turning product depth into category leadership for VertexForge",
    category: "brand",
    excerpt:
      "How we translated technical capability into a story enterprise buyers trust.",
    readTime: "7 min read",
    publishedOn: "November 2, 2025",
  },
];

export const PROJECTS: ProjectItem[] = [
  {
    slug: "northline-capital",
    name: "Northline Capital",
    industry: "Finance",
    overview:
      "Investor-facing redesign focused on trust sequencing, clarity, and conversion integrity.",
    stack: ["Next.js", "Vercel", "GSAP", "Schema"],
    result: "+141% qualified inquiry growth",
  },
  {
    slug: "pulsefit-clinics",
    name: "PulseFit Clinics",
    industry: "Healthcare",
    overview:
      "Mobile-first architecture for appointment conversion and decision confidence.",
    stack: ["Next.js", "Edge Caching", "Event Instrumentation"],
    result: "+84% booking completion",
  },
  {
    slug: "vertexforge-cloud",
    name: "VertexForge Cloud",
    industry: "SaaS",
    overview:
      "Enterprise narrative rebuild with proof surfaces and technical authority rails.",
    stack: ["React Server Components", "Telemetry", "Design System"],
    result: "+2.4x pipeline contribution",
  },
];

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "core",
    name: "Core",
    monthly: 1200,
    annual: 1100,
    lead: "For teams shipping their first serious growth site.",
    features: [
      "Monthly release sprint",
      "Core Web Vitals monitoring",
      "48-hour support routing",
      "Quarterly optimization brief",
    ],
  },
  {
    id: "velocity",
    name: "Velocity",
    monthly: 2400,
    annual: 2200,
    lead: "For brands that need weekly shipping cadence.",
    features: [
      "Bi-weekly production releases",
      "A/B testing backlog",
      "24-hour incident response",
      "Monthly growth reporting",
    ],
  },
  {
    id: "sovereign",
    name: "Sovereign",
    monthly: 4200,
    annual: 3850,
    lead: "For high-visibility operations with strict SLA expectations.",
    features: [
      "Priority roadmap ownership",
      "Security and compliance advisory",
      "4-hour response SLA",
      "Weekly executive ops review",
    ],
  },
];

export const TEAM: TeamMember[] = [
  {
    name: "Devendra Shahith",
    role: "Founder, Lead Architect",
    bio: "Leads positioning systems, UX architecture, and execution quality across the studio.",
  },
  {
    name: "Aashna Karki",
    role: "Design Director",
    bio: "Builds the anti-generic visual language and governs interaction coherence.",
  },
  {
    name: "Prakash Bista",
    role: "Performance Engineer",
    bio: "Owns Core Web Vitals budgets, telemetry, and deployment health.",
  },
  {
    name: "Isha Ghimire",
    role: "Content Systems Strategist",
    bio: "Designs search-ready narrative rails that preserve brand tone and clarity.",
  },
];

export const VALUES: ValueRail[] = [
  {
    title: "Precision over volume",
    description:
      "We choose fewer, stronger decisions that hold up under scale and scrutiny.",
  },
  {
    title: "Performance as product",
    description:
      "Speed and stability are not polish phases. They are core product expectations.",
  },
  {
    title: "Design with consequences",
    description:
      "Every visual choice must improve trust, comprehension, or conversion behavior.",
  },
  {
    title: "Operational accountability",
    description:
      "We stay in the loop after launch and own the outcomes with your team.",
  },
];

export const CONTACT_CHANNELS = [
  { label: "Email", value: "hello@echo11.com", href: "mailto:hello@echo11.com" },
  { label: "Schedule", value: "Book strategy call", href: "/contact" },
  { label: "Location", value: "Kathmandu, Nepal", href: "#" },
];

export const LEGAL_UPDATED_AT = "February 26, 2026";

export const LEGAL_TERMS: LegalSection[] = [
  {
    id: "scope",
    title: "Scope of services",
    body: [
      "Echo11 provides web design, engineering, optimization, and advisory services as defined in approved statements of work.",
      "Any deliverable not explicitly listed in a signed agreement is outside scope and requires written change approval.",
    ],
  },
  {
    id: "payments",
    title: "Fees and payments",
    body: [
      "Invoices are due based on agreed milestones or monthly cadence. Late payments may pause releases until balance is cleared.",
      "Recurring retainers auto-renew monthly unless either party gives 30 days written notice.",
    ],
  },
  {
    id: "ip",
    title: "Intellectual property",
    body: [
      "Upon full payment, client-specific deliverables transfer to the client except for pre-existing Echo11 frameworks and tooling.",
      "Echo11 may showcase non-confidential work unless a written NDA or confidentiality carve-out prohibits publication.",
    ],
  },
];

export const LEGAL_PRIVACY: LegalSection[] = [
  {
    id: "data-collection",
    title: "Data we collect",
    body: [
      "We collect contact form submissions, project inquiry details, and analytics data needed to improve service quality.",
      "We do not sell personal data and do not use sensitive personal information for profiling.",
    ],
  },
  {
    id: "data-use",
    title: "How we use data",
    body: [
      "Data is used to respond to inquiries, deliver services, and maintain platform security and reliability.",
      "We retain only necessary records for legal, operational, or contractual obligations.",
    ],
  },
  {
    id: "rights",
    title: "Your rights",
    body: [
      "You may request access, correction, or deletion of personal data by contacting hello@echo11.com.",
      "We respond to verified privacy requests within reasonable legal timelines.",
    ],
  },
];

export const LEGAL_ACCESSIBILITY: LegalSection[] = [
  {
    id: "commitment",
    title: "Accessibility commitment",
    body: [
      "Echo11 targets WCAG 2.2 AA compliance across public-facing interfaces and continuously audits critical user flows.",
      "Accessibility is integrated into design and engineering reviews, not handled as an afterthought.",
    ],
  },
  {
    id: "conformance",
    title: "Conformance status",
    body: [
      "Our latest accessibility review indicates broad conformance with WCAG 2.1 AA, with periodic improvements ongoing.",
      "If you encounter barriers, report them at hello@echo11.com so we can prioritize remediation.",
    ],
  },
  {
    id: "support",
    title: "Support and feedback",
    body: [
      "Accessibility feedback is reviewed by design and engineering leads and tracked as production work.",
      "We welcome recommendations that improve usability for assistive technology users.",
    ],
  },
];

export function getServiceBySlug(slug: string) {
  return SERVICE_PANELS.find((service) => service.slug === slug);
}

export function getStoryBySlug(slug: string) {
  return STORIES.find((story) => story.slug === slug);
}

export function getProjectBySlug(slug: string) {
  return PROJECTS.find((project) => project.slug === slug);
}
