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
    tagline: "Turning skincare discovery into a conversion engine",
    description: "TrueLuxe needed a premium commerce experience that could support product education, local payment behavior, and high mobile traffic without sacrificing performance.",
    link: "https://trueluxe-nepal.vercel.app",
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
    results: [
      { metric: "Conversion Rate", value: "+45%" },
      { metric: "Page Load Time", value: "1.2s" },
      { metric: "Mobile Users", value: "78%" },
      { metric: "Cart Abandonment", value: "-28%" }
    ],
    techStack: ["Next.js", "Stripe", "PostgreSQL", "Prisma", "Tailwind CSS"],
    features: ["Advanced Filtering", "Wishlist", "Order Tracking", "Reviews System", "Gift Cards"]
  },
  {
    id: "prika",
    title: "Prika Couture",
    category: "Fashion",
    year: "2025",
    tagline: "Luxury storytelling with production-grade performance",
    description: "Prika required a digital flagship that felt editorial and premium while still meeting strict speed and usability expectations across devices.",
    link: "https://prika.vercel.app",
    thumbnail: "/work/Prika-Luxury-Bridal-Evening-Couture-hero.webp",
    color: "#E8D5B7",
    services: ["Brand Experience", "Web Engineering", "Content Strategy", "Performance Optimization"],
    challenges: [
      "Preserve high-end brand perception without introducing heavy page weight",
      "Manage image-rich collection pages without layout shift",
      "Keep interaction quality consistent across desktop and mobile breakpoints",
      "Enable seasonal collection turnover without code churn"
    ],
    solutions: [
      "Engineered an image delivery pipeline with progressive placeholders",
      "Built responsive media patterns to stabilize visual loading behavior",
      "Implemented component-level layout rules for cross-device consistency",
      "Delivered a CMS-ready collection architecture for rapid seasonal updates"
    ],
    results: [
      { metric: "Lighthouse Score", value: "98" },
      { metric: "Image Load", value: "0.8s" },
      { metric: "Session Duration", value: "+65%" },
      { metric: "Return Rate", value: "42%" }
    ],
    techStack: ["Next.js", "Sanity CMS", "Cloudinary", "Framer Motion", "Vercel"],
    features: ["Lookbook Gallery", "Size Guide", "Style Quiz", "Wishlist", "Social Integration"]
  },
  {
    id: "leaders",
    title: "The Leaders NP",
    category: "Civic Media",
    year: "2024",
    tagline: "Nepal's history, politics, and social ideas in one platform",
    description: "The Leaders NP is a Nepal-focused knowledge platform for publishing historical context, political analysis, and social commentary with reliable data-backed storytelling.",
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
      "Built a modular publishing architecture for essays, opinion pieces, and data-led articles",
      "Implemented role-based editorial workflows with draft, review, and publish states",
      "Designed reusable data blocks for charts, context panels, and referenced insights",
      "Created admin tools for topic organization, category governance, and archive retrieval"
    ],
    results: [
      { metric: "Monthly Readers", value: "5,000+" },
      { metric: "Article Completion", value: "68%" },
      { metric: "Editorial Time Saved", value: "12hrs/week" },
      { metric: "Uptime", value: "99.9%" }
    ],
    techStack: ["React", "Node.js", "MongoDB", "AWS S3", "Redis"],
    features: ["Long-form Publishing", "Topic Archives", "Data Panels", "Editorial Workflow", "Idea Submissions"]
  },
  {
    id: "green",
    title: "Green Lifestyle",
    category: "Sustainability",
    year: "2024",
    tagline: "A community for daily sustainable living ideas",
    description: "Green Lifestyle is a sustainability platform where people share, read, and interact around practical day-to-day actions that make the environment greener.",
    link: "https://devendrashahi.pythonanywhere.com/",
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
    results: [
      { metric: "Community Growth", value: "+180%" },
      { metric: "Avg. Read Time", value: "4.5min" },
      { metric: "Weekly Engagement", value: "8%" },
      { metric: "Core Web Vitals", value: "95+" }
    ],
    techStack: ["Django", "PostgreSQL", "Bootstrap", "Mailchimp", "AWS"],
    features: ["Community Feed", "Practice Sharing", "Discussion Threads", "Topic Tags", "Newsletter"]
  },
  {
    id: "studentstack",
    title: "StudentStack",
    category: "Student Deals",
    year: "2025",
    tagline: "Find, compare, and claim student deals with confidence",
    description: "StudentStack is a student-focused benefits platform where users discover deals, discounts, and subscription offers, then follow clear step-by-step guidance to claim them.",
    link: "https://studentstack.vercel.app",
    thumbnail: "/work/StudentStack-hero.webp",
    color: "#6366F1",
    services: ["Product Design", "Platform Engineering", "Offer Data Structuring", "User Guidance UX"],
    challenges: [
      "Offer information was scattered across multiple sites and channels",
      "Students needed clarity on eligibility, deadlines, and required documents",
      "Claim processes were inconsistent and often confusing",
      "Deals changed frequently, creating trust and freshness issues"
    ],
    solutions: [
      "Built a centralized offer catalog with structured filters by category, provider, and region",
      "Created step-by-step claim playbooks for each deal with requirements and timelines",
      "Added clear eligibility notes, caveats, and verification checkpoints",
      "Implemented update workflows to keep active offers current and trustworthy"
    ],
    results: [
      { metric: "Active Students", value: "12,000+" },
      { metric: "Deal Views", value: "50k+/month" },
      { metric: "Claim Starts", value: "68%" },
      { metric: "User Trust Score", value: "72" }
    ],
    techStack: ["Next.js", "Supabase", "Prisma", "Stripe", "Vercel Edge"],
    features: ["Deal Directory", "Offer Filters", "Claim Guides", "Eligibility Notes", "Offer Updates"]
  },
  {
    id: "3am3d",
    title: "3am3d",
    category: "Creative",
    year: "2025",
    tagline: "Immersive portfolio experiences that still convert",
    description: "3am3d needed a cinematic web presence that could showcase demanding visual work while keeping inquiries and booking workflows frictionless.",
    link: "https://3am3d.vercel.app",
    thumbnail: "/work/3AM3D-Premium-Digital-Assets-hero.webp",
    color: "#8B5CF6",
    services: ["Creative Direction", "WebGL Engineering", "Portfolio UX", "Booking Systems"],
    challenges: [
      "Render high-fidelity 3D scenes without making first-load performance collapse",
      "Design interactions that felt novel but remained usable",
      "Turn complex project scoping into an understandable booking flow",
      "Keep portfolio architecture flexible as project volume grew"
    ],
    solutions: [
      "Implemented progressive scene loading with lightweight initial states",
      "Built controlled WebGL interactions with fallback-safe behavior",
      "Created a scope-aware estimator to qualify inquiries earlier",
      "Shipped a modular project system for scalable content growth"
    ],
    results: [
      { metric: "Avg. Session", value: "6min" },
      { metric: "Conversion", value: "35%" },
      { metric: "Load Time", value: "2.1s" },
      { metric: "Mobile Traffic", value: "45%" }
    ],
    techStack: ["Three.js", "React Three Fiber", "GSAP", "Framer Motion", "Supabase"],
    features: ["3D Showcase", "Project Gallery", "Quote Calculator", "Client Portal", "Case Studies"]
  }
];

export function getCaseStudy(id: string): CaseStudy | undefined {
  return caseStudies.find(project => project.id === id);
}
