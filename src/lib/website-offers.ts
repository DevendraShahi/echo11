export const CURRENCY_CODES = ["USD", "CAD", "NPR"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const OFFER_PATHS = ["foundation", "custom"] as const;
export type OfferPath = (typeof OFFER_PATHS)[number];

export const PROJECT_TYPES = [
  "ecommerce",
  "service",
  "saas",
  "web-app",
  "other",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const BUDGET_RANGES = [
  "below-start",
  "starting-range",
  "expanded-range",
  "not-sure",
] as const;
export type BudgetRange = (typeof BUDGET_RANGES)[number];

export const TIMELINE_OPTIONS = [
  "as-soon-as-possible",
  "one-to-two-months",
  "three-to-six-months",
  "flexible",
] as const;
export type InquiryTimeline = (typeof TIMELINE_OPTIONS)[number];

interface OfferDefinition {
  id: OfferPath;
  label: string;
  shortLabel: string;
  headline: string;
  description: string;
  timeline: string;
  price: Record<CurrencyCode, number>;
  includes: string[];
  bestFor: string;
}

export const OFFERS: Record<OfferPath, OfferDefinition> = {
  foundation: {
    id: "foundation",
    label: "Website foundation",
    shortLabel: "Foundation",
    headline: "Start ahead, then make every detail yours.",
    description:
      "Begin with a proven page system and delivery framework, then reshape the design, content, and experience around your brand.",
    timeline: "3–5 weeks",
    price: {
      USD: 3500,
      CAD: 4900,
      NPR: 475000,
    },
    includes: [
      "Website planning workshop",
      "Design tailored to your brand",
      "Pages designed for mobile and desktop",
      "Content organised for your chosen editing tools",
      "Website testing, analytics setup, and launch",
    ],
    bestFor: "Teams that need a distinctive marketing site on a focused timeline.",
  },
  custom: {
    id: "custom",
    label: "Custom website",
    shortLabel: "Custom build",
    headline: "Build the right digital system from first principles.",
    description:
      "We shape the strategy, interface, and engineering around a specific business model, audience, and set of operational needs.",
    timeline: "6–10 weeks",
    price: {
      USD: 8000,
      CAD: 11000,
      NPR: 1100000,
    },
    includes: [
      "Audience and customer-journey planning",
      "Original page layouts and brand styling",
      "Custom website development",
      "Connections to your business and publishing tools",
      "Website testing, launch, and handover",
    ],
    bestFor: "Teams with a unique offer, workflow, or product story that needs original thinking.",
  },
};

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  ecommerce: "E-commerce",
  service: "Service business",
  saas: "SaaS / product marketing",
  "web-app": "Web app / platform",
  other: "Something else",
};

export const TIMELINE_LABELS: Record<InquiryTimeline, string> = {
  "as-soon-as-possible": "As soon as possible",
  "one-to-two-months": "Within 1–2 months",
  "three-to-six-months": "Within 3–6 months",
  flexible: "Timing is flexible",
};

export const FOUNDATION_ARCHETYPES = [
  {
    id: "ecommerce" as const,
    index: "01",
    title: "Commerce foundation",
    description:
      "A public product-story website for brands that need stronger discovery and a clear path to an existing store. Checkout and store operations need a separately scoped Custom build.",
    features: ["Collection architecture", "Product storytelling", "Links to an existing store"],
  },
  {
    id: "service" as const,
    index: "02",
    title: "Service and lead-gen foundation",
    description:
      "A trust-focused website for consultancies, studios, and specialist teams that need better-qualified conversations.",
    features: ["Offer positioning", "Proof and case-study system", "Lead qualification flow"],
  },
  {
    id: "saas" as const,
    index: "03",
    title: "SaaS and product foundation",
    description:
      "A clear product narrative for software teams that need to explain value, demonstrate capability, and move users toward action.",
    features: ["Feature storytelling", "Use-case architecture", "Demo or waitlist conversion"],
  },
];

export const WEBSITE_DIRECTION_IDS = [
  "commerce-story",
  "service-proof",
  "product-narrative",
] as const;

export type WebsiteDirectionId = (typeof WEBSITE_DIRECTION_IDS)[number];

export interface WebsiteDirection {
  id: WebsiteDirectionId;
  number: string;
  eyebrow: string;
  title: string;
  /**
   * The one-word name for the narrow screens, where the switcher is pinned and
   * three names have to sit side by side without scrolling. It is the first word
   * of `eyebrow`, so the short label never says anything the long one does not.
   */
  short: string;
  summary: string;
  outcome: string;
  bestFor: string;
  projectType: ProjectType;
  preview: "commerce" | "service" | "product";
  adapts: string[];
  /**
   * Case study ids from `@/data/caseStudies` that this direction is drawn from.
   * Ids rather than imported records keep the offer data independent of the
   * portfolio data; the Home surface resolves them and skips any id it cannot
   * find.
   *
   * The first entry is the plate the direction panel shows, so it must be a
   * project whose `thumbnail` is a real capture of the product. Today Green
   * Lifestyle's thumbnail is a stock photograph, so it can be credited by name
   * but must not lead this list.
   */
  proof: string[];
}

/**
 * These are adaptable website directions, not client templates for resale.
 * A selected id is intentionally stored as the inquiry reference so the sales
 * conversation begins with the buyer's chosen direction.
 *
 * Each direction also names the real projects it was drawn from. The direction
 * is a reusable system, so those projects are provenance rather than a design
 * the buyer is buying, and the Home section shows the leading project's own
 * capture in place of a coded study.
 */
export const WEBSITE_DIRECTIONS: WebsiteDirection[] = [
  {
    id: "commerce-story",
    number: "01",
    eyebrow: "Commerce direction",
    title: "The considered shop",
    short: "Commerce",
    summary: "A product story that earns attention before it asks for a purchase.",
    outcome: "Build product confidence through a considered public showcase, with a clear link to your existing store.",
    bestFor: "Product brands with a small, focused range or a hero collection.",
    projectType: "ecommerce",
    preview: "commerce",
    adapts: ["Collection and product hierarchy", "Editorial product storytelling", "Campaign and conversion modules"],
    proof: ["trueluxe", "siyo-dhaago"],
  },
  {
    id: "service-proof",
    number: "02",
    eyebrow: "Service direction",
    title: "The credible practice",
    short: "Service",
    summary: "A calm, high-trust system that lets expertise do the convincing.",
    outcome: "Turn a complex service into an understandable offer and a better-qualified conversation.",
    bestFor: "Studios, specialist teams, consultancies, and professional services.",
    projectType: "service",
    preview: "service",
    adapts: ["Offer and audience hierarchy", "Proof, case-study, and team modules", "Consultation and qualification flow"],
    proof: ["fluids"],
  },
  {
    id: "product-narrative",
    number: "03",
    eyebrow: "Product direction",
    title: "The clear product",
    short: "Product",
    summary: "A sharp product narrative for people who need to understand value quickly.",
    outcome: "Connect the feature set, use cases, and next action without burying the product in detail.",
    bestFor: "SaaS teams, platforms, and digital products preparing to grow.",
    projectType: "saas",
    preview: "product",
    adapts: ["Feature and use-case architecture", "Demo, trial, or waitlist journeys", "Product proof and integration modules"],
    proof: ["curriculumos", "green"],
  },
];

export function getWebsiteDirection(id?: string): WebsiteDirection | undefined {
  return WEBSITE_DIRECTIONS.find((direction) => direction.id === id);
}

export interface WebsiteInquiryInput {
  offerPath: OfferPath;
  projectType: ProjectType;
  name: string;
  email: string;
  company: string;
  currentWebsite?: string;
  budgetRange: BudgetRange;
  timeline: InquiryTimeline;
  goals: string;
  referenceProject?: string;
  sourcePath: string;
  currency: CurrencyCode;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  website?: string;
}

export interface InquiryResult {
  success: boolean;
  inquiryId?: string;
  error?: string;
  fieldErrors?: Partial<Record<keyof WebsiteInquiryInput, string>>;
}

export function isCurrencyCode(value: string | undefined): value is CurrencyCode {
  return CURRENCY_CODES.includes(value as CurrencyCode);
}

export function isOfferPath(value: string | undefined): value is OfferPath {
  return OFFER_PATHS.includes(value as OfferPath);
}

export function isProjectType(value: string | undefined): value is ProjectType {
  return PROJECT_TYPES.includes(value as ProjectType);
}

export function currencyForCountry(countryCode?: string | null): CurrencyCode {
  if (countryCode?.toUpperCase() === "CA") return "CAD";
  if (countryCode?.toUpperCase() === "NP") return "NPR";
  return "USD";
}

export function formatOfferPrice(offerPath: OfferPath, currency: CurrencyCode): string {
  const amount = OFFERS[offerPath].price[currency].toLocaleString("en-US");

  if (currency === "CAD") return `C$${amount}`;
  if (currency === "NPR") return `Rs ${amount}`;
  return `$${amount}`;
}

export function getBudgetOptions(offerPath: OfferPath, currency: CurrencyCode) {
  const startingPrice = OFFERS[offerPath].price[currency];
  const expandedPrice = startingPrice * 2;
  const formatAmount = (amount: number) => {
    const formatted = amount.toLocaleString("en-US");
    if (currency === "CAD") return `C$${formatted}`;
    if (currency === "NPR") return `Rs ${formatted}`;
    return `$${formatted}`;
  };

  return [
    { value: "below-start" as const, label: `Below ${formatAmount(startingPrice)}` },
    {
      value: "starting-range" as const,
      label: `${formatAmount(startingPrice)}–${formatAmount(expandedPrice)}`,
    },
    { value: "expanded-range" as const, label: `${formatAmount(expandedPrice)}+` },
    { value: "not-sure" as const, label: "I need help setting a range" },
  ];
}
