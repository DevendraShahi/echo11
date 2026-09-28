export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  year: string;
  tagline: string;
  description: string;
  link: string | null;
  thumbnail: string;
  color: string;
  services: string[];
  challenges: string[];
  solutions: string[];
  results: { metric: string; value: string }[];
  techStack: string[];
  features: string[];
}

export const caseStudies: CaseStudy[] = [
  {
    id: "trueluxe",
    title: "TrueLuxe Nepal",
    category: "E-Commerce",
    year: "2025",
    tagline: "A clearer skincare shopping experience for mobile-first buyers",
    description: "TrueLuxe needed a commerce site that could explain products clearly, support local buying behavior, and keep the shopping experience simple on mobile.",
    link: "https://trueluxe-nepal.vercel.app",
    thumbnail: "/work/TrueLuxe-Nepal-Premium-Beauty-Skincare-TrueLuxe-Nepal-hero.webp",
    color: "#C4A77D",
    services: ["Product Strategy", "UX/UI Design", "Commerce Engineering", "Backend Integration"],
    challenges: [
      "Help shoppers choose the right products across skin concerns, routines, and budget levels",
      "Integrate local payment gateways while keeping checkout simple and reliable",
      "Deliver a polished visual experience on mid-range mobile devices",
      "Keep stock and product state synchronized across catalog and checkout"
    ],
    solutions: [
      "Built a faceted discovery flow with smart defaults and low-friction filtering",
      "Designed checkout handling around local payment expectations and clear purchase states",
      "Designed a mobile-first interface tuned for low-bandwidth consistency",
      "Added event-driven inventory sync and status-aware purchase validation"
    ],
    results: [
      { metric: "Live commerce experience", value: "Launched" },
      { metric: "Mobile-first shopping flow", value: "Improved" },
      { metric: "Guided product discovery", value: "Clarified" },
      { metric: "Checkout reliability", value: "Strengthened" }
    ],
    techStack: ["Next.js", "Stripe", "PostgreSQL", "Prisma", "Tailwind CSS"],
    features: ["Advanced Filtering", "Wishlist", "Order Tracking", "Reviews System", "Gift Cards"]
  },
  {
    id: "leaders",
    title: "The Leaders NP",
    category: "Civic Media",
    year: "2024",
    tagline: "A structured publishing platform for Nepal-focused civic writing",
    description: "The Leaders NP needed a clear publishing experience for historical context, political analysis, and social commentary without making long-form reading feel heavy.",
    link: "https://the-leadersnp.com",
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
      "Built a modular publishing structure for essays, opinion pieces, and data-led articles",
      "Implemented role-based editorial workflows with draft, review, and publish states",
      "Designed reusable data blocks for charts, context panels, and referenced insights",
      "Created admin tools for topic organization, category governance, and archive retrieval"
    ],
    results: [
      { metric: "Editorial publishing system", value: "Structured" },
      { metric: "Long-form reading flow", value: "Improved" },
      { metric: "Topic organization", value: "Clarified" },
      { metric: "Admin workflow", value: "Supported" }
    ],
    techStack: ["React", "Node.js", "MongoDB", "AWS S3", "Redis"],
    features: ["Long-form Publishing", "Topic Archives", "Data Panels", "Editorial Workflow", "Idea Submissions"]
  },
  {
    id: "curriculum-os",
    title: "curriculum.os",
    category: "Education Platform",
    year: "2025",
    tagline: "A planning workspace for curriculum structure and review",
    description: "curriculum.os helps education teams organize programs, modules, and delivery details in one clearer workspace for planning and stakeholder review.",
    link: "https://curriculum-os-tan.vercel.app",
    thumbnail: "/work/echo11-Product-Engineering-Studio-hero.webp",
    color: "#00E5FF",
    services: ["Product Strategy", "UX/UI Design", "Platform Engineering", "Information Architecture"],
    challenges: [
      "Translate curriculum planning work into a clear product structure",
      "Make program and module information easier to scan and manage",
      "Design a workspace that feels useful for repeat planning sessions",
      "Keep the interface focused enough for early-stage validation"
    ],
    solutions: [
      "Mapped curriculum entities into an organized product information architecture",
      "Created focused planning flows around programs, modules, and learning details",
      "Designed a calm interface system that supports comparison and editing",
      "Built the product as a live, inspectable web platform for stakeholder feedback"
    ],
    results: [
      { metric: "Live product prototype", value: "Launched" },
      { metric: "Curriculum IA", value: "Defined" },
      { metric: "Planning workflow", value: "Simplified" },
      { metric: "Stakeholder review", value: "Enabled" }
    ],
    techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Vercel"],
    features: ["Program Planning", "Module Structure", "Curriculum Workspace", "Review Flow", "Responsive UI"]
  }
];

export function getCaseStudy(id: string): CaseStudy | undefined {
  return caseStudies.find(project => project.id === id);
}
