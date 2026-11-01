export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  kind: "client" | "concept" | "owned";
  publication?: "draft";
  year: string;
  tagline: string;
  description: string;
  portfolioBrief?: {
    audience: string;
    problem: string;
    contribution: string;
  };
  link: string | null;
  sourceLink?: string;
  /**
   * The date `link` was last opened and answered. Kept beside the URL it
   * describes so that verifying a reachable URL is an edit to the same record
   * that holds the URL. Present means verified; absent means unverified.
   *
   * Nothing enforces this. `link` is still a plain string that any surface can
   * render, so each consumer has to check this field itself. `FeaturedWork`,
   * `src/app/work/[slug]/CaseStudyContent.tsx`, and
   * `src/app/make-it-yours/FoundationsExperience.tsx` do; any new surface that
   * offers an outbound action must consult it too. Last swept 2026-10-03.
   */
  linkVerifiedOn?: string;
  thumbnail: string;
  color: string;
  services: string[];
  challenges: string[];
  solutions: string[];
  /**
   * Optional because a project without verified numbers ships no section
   * rather than an invented one: `CaseStudyContent` renders the metrics band
   * only when this is non-empty.
   */
  results?: { metric: string; value: string }[];
  techStack: string[];
  /** Publish implementation details only when source has been checked. */
  techStackVerified?: boolean;
  features: string[];
  /** Capabilities not already explained by solutions; used in the case-study narrative. */
  additionalFeatures?: string[];
}

// Keep unfinished records available for future work without publishing them.
const projectRecords: CaseStudy[] = [
  {
    id: "forge",
    portfolioBrief: {
      audience: "Gym members deciding where to train with intent.",
      problem: "Give a strength gym a point of view that holds from the first scroll to the membership tiers.",
      contribution: "An original brand system, a five-chapter scroll narrative, and the live showcase site built to run it.",
    },
    title: "FORGE",
    category: "Fitness & Performance",
    kind: "concept",
    year: "2026",
    tagline: "A strength gym brand, from manifesto to membership",
    description: "FORGE is an Echo11-owned brand and website concept for a strength gym. A forge-black, steel, and ember identity runs through one continuous scrolling site — manifesto, training programs, facility, coaches and schedule, membership tiers, and a journal — presented as a single experience rather than a brochure split into pages.",
    link: "/showcase/forge",
    linkVerifiedOn: "2026-11-01", // local showcase checked before release
    thumbnail: "/work/Forge-hero.jpg",
    color: "#E34A21",
    services: ["Brand Strategy", "Visual Identity", "Experience Design", "Frontend Build"],
    challenges: [
      "Give an imagined strength gym an identity that stands apart from interchangeable fitness branding",
      "Carry one voice from manifesto through programs, facility, and coaches without the site fragmenting into pages",
      "Make scroll motion read as progression and heat rather than decoration",
      "Keep schedules, tiers, and practical detail clear while the storytelling stays cinematic"
    ],
    solutions: [
      "Built a forge-black, steel, and ember palette with condensed display type as the brand's main gesture",
      "Structured the site as five chapters on one continuous scroll: manifesto, training, facility, coaches, membership",
      "Choreographed masked reveals and a scroll-driven forging sequence, with stacked static fallbacks for mobile and reduced motion",
      "Held practical content — class schedule, membership tiers, journal — in strict mono-labelled modules"
    ],
    techStack: ["HTML", "CSS", "JavaScript", "GSAP"],
    techStackVerified: true,
    additionalFeatures: ["Facility Numbers"],
    features: ["Manifesto & Forging Scroll", "Programs & Training Cards", "Facility Numbers", "Coaches & Class Schedule", "Membership Tiers", "Journal"]
  },
  {
    id: "laltin",
    title: "LALTIN",
    category: "Hospitality & Place",
    kind: "concept",
    year: "2026",
    tagline: "A mountain retreat, shaped around stillness",
    description: "LALTIN is an Echo11-owned resort website concept. A warm editorial identity connects stays, landscape, food, and the people behind the place. The live showcase includes a day-to-night experience and an illustrative stay planner; it does not take reservations or show live availability.",
    portfolioBrief: {
      audience: "Travellers exploring a quieter kind of mountain retreat.",
      problem: "Let people imagine the experience while keeping stays, practical details, and the next step easy to find.",
      contribution: "An editorial website concept with a responsive layout, day-to-night presentation, and a demonstrative stay planner.",
    },
    link: "/laltin",
    linkVerifiedOn: "2026-11-01",
    thumbnail: "/showcase/previews/laltin.jpg",
    color: "#C79254",
    services: ["Art Direction", "Experience Design", "Frontend Build"],
    challenges: [
      "Give an imagined retreat a distinct sense of place",
      "Balance atmospheric imagery with readable room and travel information",
      "Carry the experience from daylight into an evening presentation",
      "Demonstrate a stay-planning journey without implying real availability"
    ],
    solutions: [
      "Built a warm visual system around landscape, editorial typography, and generous spacing",
      "Connected rooms, experiences, food, and practical travel information in one scrolling site",
      "Added a day-to-night presentation with responsive imagery and motion fallbacks",
      "Created a date-and-guest planner that validates selections and displays an illustrative summary"
    ],
    techStack: ["Next.js", "React", "TypeScript", "GSAP", "CSS"],
    techStackVerified: true,
    features: ["Stay Collection", "Day & Night Presentation", "Experience Stories", "Illustrative Stay Planner"]
  },
  {
    id: "trueluxe",
    portfolioBrief: {
      audience: "Skincare shoppers in Nepal comparing concerns, routines and budgets.",
      problem: "Help people choose the right products across skin concerns, routines, and price without a store assistant.",
      contribution: "A faceted discovery flow, resilient local payment handling, and a mobile-first storefront tuned for low-bandwidth devices.",
    },
    title: "TrueLuxe Nepal",
    category: "E-Commerce",
    kind: "client",
    year: "2025",
    tagline: "Turning skincare discovery into a conversion engine",
    description: "TrueLuxe needed a premium commerce experience that could support product education, local payment behavior, and high mobile traffic without sacrificing performance.",
    link: "https://true-luxe-nepal.vercel.app",
    linkVerifiedOn: "2026-11-01", // 200; storefront title confirmed
    thumbnail: "/work/TrueLuxe-Nepal-Premium-Beauty-Skincare-TrueLuxe-Nepal-hero.webp",
    color: "#C4A77D",
    services: ["Product Strategy", "UX/UI Design", "Commerce Engineering", "Backend Integration"],
    challenges: [
      "Help shoppers choose the right products across skin concerns, routines, and budget levels",
      "Integrate local payment gateways while keeping checkout simple and reliable",
      "Deliver a premium visual experience on mid-range mobile devices",
      "Keep stock and product state synchronized across catalog and checkout"
    ],
    solutions: [
      "Built a faceted discovery flow with smart defaults and low-friction filtering",
      "Implemented resilient payment orchestration with retry and fallback handling",
      "Designed a mobile-first interface tuned for low-bandwidth consistency",
      "Added event-driven inventory sync and status-aware purchase validation"
    ],
    techStack: ["Next.js", "Stripe", "PostgreSQL", "Prisma", "Tailwind CSS"],
    features: ["Advanced Filtering", "Wishlist", "Order Tracking", "Reviews System", "Gift Cards"]
  },
  {
    id: "siyo-dhaago",
    title: "Siyo Dhaago",
    category: "Fashion & Editorial",
    kind: "concept",
    year: "2026",
    tagline: "Occasionwear with a sharper point of view",
    description: "Siyo Dhaago is an Echo11-owned fashion brand concept. The work pairs a concise identity with an editorial storefront designed to make every collection feel deliberate, not crowded.",
    link: null,
    thumbnail: "/work/Siyo-Dhaago-hero.png",
    color: "#E8D5B7",
    services: ["Naming & Positioning", "Art Direction", "Editorial Commerce", "Website Design & Build"],
    challenges: [
      "Give a fictional fashion label a recognisable voice without relying on trends",
      "Let collection photography lead while keeping product paths easy to follow",
      "Build an editorial system that supports new drops without redesigning the site",
      "Keep the experience considered across mobile and desktop"
    ],
    solutions: [
      "Created a minimal brand language grounded in proportion, contrast, and texture",
      "Planned collection, lookbook, and product templates around visual pacing",
      "Designed reusable campaign modules for seasonal storytelling",
      "Defined responsive interaction rules that preserve the editorial feeling"
    ],
    techStack: ["Next.js", "Sanity CMS", "Cloudinary", "Framer Motion"],
    additionalFeatures: ["Size Guidance"],
    features: ["Collection Stories", "Lookbook Templates", "Editorial Product Pages", "Size Guidance", "Campaign Landing Pages"]
  },
  {
    id: "leaders",
    portfolioBrief: {
      audience: "Readers exploring Nepal’s history, politics, and social ideas.",
      problem: "Make complex subjects readable while giving editors a consistent publishing workflow.",
      contribution: "Structured articles, reusable context blocks, topic archives, and a draft-to-publish editorial system.",
    },
    title: "The Leaders NP",
    category: "Civic Media",
    kind: "client",
    year: "2024",
    tagline: "Nepal's history, politics, and social ideas in one platform",
    description: "The Leaders NP is a Nepal-focused knowledge platform for publishing historical context, political analysis, and social commentary with reliable data-backed storytelling.",
    link: "https://the-leadersnp.com",
    linkVerifiedOn: "2026-11-01", // 200; publishing site title confirmed
    thumbnail: "/work/The-Leaders-LeadersNP-hero.webp",
    color: "#1E3A5F",
    services: ["Editorial Platform Design", "Content Engineering", "Data Modeling", "Admin Workflow Systems"],
    challenges: [
      "Present complex historical and political topics in readable, structured formats",
      "Support long-form publishing while preserving editorial consistency",
      "Integrate data points and references without cluttering the reading experience",
      "Provide clear workflows for writers, editors, and admins"
    ],
    solutions: [
      "Built a modular publishing architecture for essays, opinion pieces, and data-led articles",
      "Implemented role-based editorial workflows with draft, review, and publish states",
      "Designed reusable data blocks for charts, context panels, and referenced insights",
      "Created admin tools for topic organization, category governance, and archive retrieval"
    ],
    techStack: ["React", "Node.js", "MongoDB", "AWS S3", "Redis"],
    additionalFeatures: ["Idea Submissions"],
    features: ["Long-form Publishing", "Topic Archives", "Data Panels", "Editorial Workflow", "Idea Submissions"]
  },
  {
    id: "green",
    title: "Green Lifestyle",
    category: "Sustainability",
    kind: "client",
    year: "2024",
    tagline: "A community for daily sustainable living ideas",
    description: "Green Lifestyle is a sustainability platform where people share, read, and interact around practical day-to-day actions that make the environment greener.",
    link: null, // Previous public deployment returned 404 on 2026-11-01.
    thumbnail: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    color: "#4A7C59",
    services: ["Community Product Design", "Content Platform Engineering", "Engagement Systems", "Newsletter Enablement"],
    challenges: [
      "Encourage consistent community contributions with high-quality sustainability content",
      "Make discussion and idea-sharing feel safe, constructive, and easy to follow",
      "Design interaction loops that reward practical action rather than passive scrolling",
      "Keep performance stable for frequent mobile users"
    ],
    solutions: [
      "Built contribution flows for sharing sustainable practices with clear content structure",
      "Implemented threaded interaction patterns for discussion and peer learning",
      "Added moderation-ready controls and content organization by sustainability themes",
      "Optimized mobile performance for fast repeat visits and community engagement"
    ],
    techStack: ["Django", "PostgreSQL", "Bootstrap", "Mailchimp", "AWS"],
    additionalFeatures: ["Newsletter"],
    features: ["Community Feed", "Practice Sharing", "Discussion Threads", "Topic Tags", "Newsletter"]
  },
  {
    id: "ivision",
    title: "Ivision",
    category: "Eyewear & Commerce",
    kind: "concept",
    year: "2026",
    tagline: "Frames considered through shape, fit, and material",
    description: "Ivision is an Echo11-owned eyewear concept that turns a difficult product choice into a calm, visual buying experience. Editorial photography, optical and sun collections, and a guide to shape, fit, and everyday style create a considered path through the collection.",
    link: "https://ivision.echo11.tech",
    linkVerifiedOn: "2026-11-01", // 200; eyewear site title confirmed
    thumbnail: "/work/Ivision-hero.webp",
    color: "#BCAF9C",
    services: ["Brand Strategy", "Art Direction", "Fit-Guide UX", "Website Design & Build"],
    challenges: [
      "Make an unfamiliar eyewear choice feel considered rather than technical",
      "Build a visual identity with enough character to carry a full collection",
      "Balance image-led browsing with practical fit guidance",
      "Create one experience for optical and sun frames"
    ],
    solutions: [
      "Defined a shape-first naming and navigation system for the collection",
      "Developed an editorial image language rooted in material and proportion",
      "Mapped a guided selection path around fit, shape, and use",
      "Created shared collection patterns for optical and sun frames"
    ],
    techStack: ["Next.js", "Shopify", "Tailwind CSS"],
    additionalFeatures: ["Frame Detail Pages", "Editorial Campaign Modules"],
    features: ["Shape-led Discovery", "Guided Fit Flow", "Optical & Sun Collections", "Frame Detail Pages", "Editorial Campaign Modules"]
  },
  {
    id: "fluids",
    title: "Fluids",
    category: "Beverage Brand & Campaign",
    kind: "concept",
    year: "2026",
    tagline: "A beverage brand built for momentum",
    description: "Fluids is an Echo11-owned beverage concept built to show how a brand can enter a crowded category with one strong visual system and a campaign site that gives the product momentum.",
    link: null,
    thumbnail: "/work/Fluids-hero.png",
    color: "#00E5FF",
    services: ["Brand Positioning", "Packaging Direction", "Campaign Art Direction", "Website Design & Build"],
    challenges: [
      "Find a recognisable territory for an imagined drink brand without visual noise",
      "Make a single can feel like the centre of a larger campaign system",
      "Balance product facts with a clear, energetic story",
      "Give retail moments, launch events, and community activity one home"
    ],
    solutions: [
      "Created a visual identity using chrome, cyan, and deep blue",
      "Developed a campaign structure that moves from product to activation",
      "Planned dedicated space for ingredients, serving facts, and responsible messaging",
      "Designed flexible modules for retail, event, and launch stories"
    ],
    techStack: ["Next.js", "Framer Motion", "Tailwind CSS"],
    additionalFeatures: [],
    features: ["Campaign Landing Page", "Product Story", "Ingredient Facts", "Launch Moments", "Retail & Event Modules"]
  },
  {
    id: "dropdate",
    title: "DateDrop",
    category: "Consumer App",
    kind: "client",
    year: "2026",
    tagline: "Plan the perfect date and send it as a link",
    description: "DateDrop turns a vague maybe into a single link. One person sets the time, food, and vibe, or hands the plan over, and the invite respects a schedule that can actually hold while the link unfolds the plan for whoever receives it.",
    link: "https://datedrop-me.vercel.app/",
    linkVerifiedOn: "2026-11-01", // 200; invitation site title confirmed (not a full app test)
    thumbnail: "/work/DateDrop-hero.webp",
    color: "#E23B4F",
    services: ["Product Design", "Interaction Design", "Web Engineering"],
    challenges: [
      "Turn an awkward ask into something that feels easy to say yes to",
      "Keep one person in control while letting the other shape the plan",
      "Respect real schedules instead of open-ended suggestions",
      "Deliver the whole invitation through one shareable link"
    ],
    solutions: [
      "Offered two entry paths: build the plan yourself or hand the plan over",
      "Sequenced the link so the ask lands first and the plan unfolds after",
      "Anchored picking to a concrete date and time the sender can protect",
      "Kept the invitation to a single link that carries both the ask and the plan"
    ],
    techStack: ["Next.js", "Vercel"],
    additionalFeatures: [],
    features: ["Plan Builder", "Partner Planning Mode", "Shareable Invite Link", "Schedule Picking"]
  },
  {
    id: "curriculumos",
    title: "CurriculumOS",
    category: "Learning Platform",
    kind: "client",
    year: "2026",
    tagline: "A learning workspace where curriculum, practice, and momentum live together",
    description: "CurriculumOS is a learning operating system for curriculum delivery: structured courses and modules, lesson and quiz flows, live progress tracking, and an in-browser coding sandbox, all read from one workspace.",
    link: "https://curriculum-os-tan.vercel.app/",
    linkVerifiedOn: "2026-11-01", // 200; learning workspace title confirmed
    thumbnail: "/work/CurriculumOS-hero.webp",
    color: "#3B82F6",
    services: ["Learning Product Design", "Curriculum Systems", "Progress Analytics", "Practice Environment"],
    challenges: [
      "Deliver courses, modules, lessons, and quizzes as one coherent system",
      "Show progress and momentum without turning the workspace into a dashboard maze",
      "Give learners a real place to write and run code while they learn",
      "Keep accounts, content, and media organized as the catalogue grows"
    ],
    solutions: [
      "Built structured course, module, lesson, and quiz flows behind one catalog",
      "Surfaced momentum as streaks, sessions, and a four-week activity view",
      "Integrated an in-browser coding sandbox with mission checkpoints",
      "Adopted accounts, cloud media, and event-streamed progress tracking"
    ],
    techStack: ["Next.js", "Clerk", "Monaco Editor", "Sandpack", "visx", "Cloudinary"],
    additionalFeatures: [],
    features: ["Course Catalog", "Lesson Runtime", "Quiz Attempts", "Progress Tracking", "Coding Playground"]
  },
  {
    id: "jayvis",
    title: "JayVis",
    category: "Developer Tools",
    kind: "client",
    year: "2026",
    tagline: "A database modeling workspace where the diagram and the code stay in sync",
    description: "JayVis, also shipped as StitchDB, is a developer-first database modeling workspace that bridges declarative DBML and visual ERDs through one AST: bidirectional canvas and editor sync, live schema validation, a SQL builder, and export to Prisma, SVG, or JSON.",
    link: "https://jayvis.echo11.tech",
    linkVerifiedOn: "2026-11-01", // 200; Visual Database Schema Studio title confirmed
    sourceLink: "https://github.com/DevendraShahi/JayVis",
    thumbnail: "/work/JayVis-StitchDB-hero.webp",
    color: "#8B5CF6",
    services: ["Product Design", "Visual Editor Engineering", "Schema Tooling"],
    challenges: [
      "Keep a text schema and a visual diagram truthful to each other in both directions",
      "Make a dense modeling canvas usable on an ordinary laptop screen",
      "Surface schema problems while people edit rather than after they finish",
      "Carry a drawn design into a real database"
    ],
    solutions: [
      "Used one AST as the source of truth for the DBML editor and the ERD canvas",
      "Built a command palette, context menus, and fit-view navigation around the canvas",
      "Ran live validation with a status badge and inline table notes",
      "Shipped SQL generation plus Prisma, SVG, and JSON export paths"
    ],
    techStack: ["Next.js", "Prisma", "CodeMirror", "Tailwind CSS", "shadcn/ui"],
    additionalFeatures: [],
    features: ["Bidirectional ERD Sync", "SQL Builder", "Command Palette", "Schema Validation", "Prisma Export"]
  },
  {
    id: "budgetmate",
    publication: "draft",
    title: "BudgetMate",
    category: "Mobile App",
    kind: "client",
    year: "2025",
    tagline: "Track expenses, set budgets, and see where the money goes",
    description: "BudgetMate is a personal finance app under active development: log and categorize transactions, set monthly budgets, and read spending reports, with encrypted data that syncs across devices.",
    link: null, // under development; the only deployment is a placeholder, not the app
    thumbnail: "/work/BudgetMate-hero.webp",
    color: "#2E86AB",
    services: ["Product Design", "Mobile Engineering", "Data & Reporting"],
    challenges: [
      "Make daily expense logging fast enough that it actually happens",
      "Turn raw transactions into budgets people understand",
      "Present financial insight without assuming a finance background",
      "Keep personal data safe across devices"
    ],
    solutions: [
      "Built a categorized transaction flow for quick logging",
      "Added monthly budgets with spending habit tracking",
      "Shipped reports and charts for expense insight",
      "Encrypted financial data and synced it across devices"
    ],
    techStack: ["Flutter", "Laravel"],
    additionalFeatures: [],
    features: ["Expense Tracking", "Budget Management", "Financial Insights", "Multi-Device Sync", "Encrypted Storage"]
  },
  {
    id: "expresssocial",
    title: "ExpressSocialNP",
    category: "Agency Website",
    kind: "client",
    year: "2024",
    tagline: "Helping businesses thrive in the market",
    description: "The site for Expressocial, a social media agency: an about section that explains the campaign work, the six-person team, a projects gallery, partners, and contacts, held together as one static page with persistent navigation.",
    // Owner supplied http://devendrashahi.me/ExpressSocialNP/; HTTP/HTTPS and
    // the previous github.io address returned 404 on 2026-11-01.
    link: null,
    sourceLink: "https://github.com/DevendraShahi/ExpressSocialNP",
    thumbnail: "/work/ExpressSocialNP-hero.webp",
    color: "#E79BB8",
    services: ["Website Design", "Content Structure", "Frontend Development"],
    challenges: [
      "Present a service business, its people, and its work without a CMS behind it",
      "Show visual campaign work at a quality that sells the craft",
      "Keep the team and contact paths easy to find on one page",
      "Stay maintainable on plain hosting with no build step"
    ],
    solutions: [
      "Laid the site out as anchored sections for about, team, projects, partners, and contacts",
      "Used full-bleed media and a gallery script for the visual work",
      "Kept persistent navigation across every section",
      "Built it as static HTML, CSS, and JavaScript that hosts anywhere"
    ],
    techStack: ["HTML", "CSS", "JavaScript"],
    additionalFeatures: [],
    features: ["Team Section", "Projects Gallery", "Partner Showcase", "Contact Section"]
  },
  {
    id: "stepoutinstyle",
    portfolioBrief: {
      audience: "Footwear shoppers browsing across categories and brands.",
      problem: "Organise a broad catalogue so shoppers can find the right shoes without competing offers crowding the experience.",
      contribution: "Original branding and a storefront organised around categories, product discovery, deals, and a clear cart path.",
    },
    title: "StepOutInStyle",
    category: "E-Commerce",
    kind: "owned",
    year: "2025",
    tagline: "Walk in Style, Stride in Confidence",
    description: "A shoes storefront built around categories and brands: browse sneakers, boots, loafers, and more from Adidas, Nike, Puma, Jordan and others, with daily deals, trending products, and a cart path through to checkout.",
    // Confirmed repository; github.io and the matching custom-domain Pages
    // path returned 404 on 2026-11-01. Keep source accessible without a dead CTA.
    link: null,
    sourceLink: "https://github.com/DevendraShahi/StepOutInStyle",
    thumbnail: "/work/StepOutInStyle-hero.webp",
    color: "#DC2F4E",
    services: ["Storefront Design", "Catalogue UX", "Frontend Development"],
    challenges: [
      "Make a wide shoe catalogue easy to browse by category and brand",
      "Keep deals, trends, and new arrivals from crowding the shop",
      "Support a cart and checkout path on a static frontend",
      "Present products consistently across many brands and types"
    ],
    solutions: [
      "Structured navigation around categories, brands, and product types",
      "Separated deal, trend, and new-arrival modules beneath the hero",
      "Built a cart with item totals and checkout entry points",
      "Normalized product cards across brands with shared templates"
    ],
    techStack: ["HTML", "CSS", "JavaScript"],
    additionalFeatures: ["Search"],
    features: ["Brand Browse", "Category Navigation", "Deal of the Day", "Cart and Checkout", "Search"]
  }
];

export const caseStudies: CaseStudy[] = projectRecords.filter(project => project.publication !== "draft");

export const liveConcepts = caseStudies.filter(project =>
  project.kind === "concept" && (project.id === "forge" || project.id === "laltin")
);

export function getCaseStudy(id: string): CaseStudy | undefined {
  return caseStudies.find(project => project.id === id);
}
