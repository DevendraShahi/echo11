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
    tagline: "Premium skincare marketplace reimagined",
    description: "A sophisticated e-commerce platform for premium skincare products, featuring advanced filtering, personalized recommendations, and a seamless checkout experience tailored for the Nepali market.",
    link: "https://trueluxe.example.com",
    thumbnail: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
    color: "#C4A77D",
    services: ["UX Research", "UI Design", "Frontend Development", "Backend Integration"],
    challenges: [
      "Complex product filtering across multiple categories and skin types",
      "Integration with local payment gateways (eSewa, Khalti)",
      "Mobile-first design for Nepali market demographics",
      "Inventory management with real-time stock updates"
    ],
    solutions: [
      "Built an intuitive faceted search system with intelligent defaults",
      "Implemented seamless payment gateway integration with retry logic",
      "Designed responsive mobile experience prioritized for 4G connectivity",
      "Created real-time inventory sync with webhook notifications"
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
    tagline: "Where fashion meets digital artistry",
    description: "An elegant digital storefront for a luxury fashion brand, featuring immersive product showcases, lookbook galleries, and a bespoke shopping experience that reflects the brand's premium identity.",
    link: "https://prika.vercel.app",
    thumbnail: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
    color: "#E8D5B7",
    services: ["Brand Design", "Web Development", "Content Strategy", "Performance Optimization"],
    challenges: [
      "Creating an immersive visual experience without sacrificing performance",
      "High-resolution image management and lazy loading",
      "Implementing a unique brand experience across all devices",
      "Seasonal collections requiring flexible content management"
    ],
    solutions: [
      "Developed custom image optimization pipeline with blur placeholders",
      "Implemented progressive image loading with intersection observers",
      "Created fluid responsive system with CSS container queries",
      "Built CMS-ready architecture for seamless collection updates"
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
    category: "Corporate",
    year: "2024",
    tagline: "Empowering corporate excellence",
    description: "A comprehensive corporate platform featuring news aggregation, event management, member directories, and an integrated learning management system for Nepal's business leaders.",
    link: "https://the-leadersnp.com",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80",
    color: "#1E3A5F",
    services: ["Platform Development", "System Architecture", "Admin Dashboard", "API Development"],
    challenges: [
      "Aggregating content from multiple RSS feeds and social sources",
      "Complex role-based access control for different membership tiers",
      "Event registration with capacity management and waitlists",
      "Secure document management with version control"
    ],
    solutions: [
      "Built custom aggregation system with smart caching and deduplication",
      "Implemented granular permissions with inheritance patterns",
      "Created real-time availability updates with optimistic UI",
      "Developed document system with audit trails and e-signatures"
    ],
    results: [
      { metric: "Active Members", value: "5,000+" },
      { metric: "Event Capacity", value: "98% fill" },
      { metric: "Admin Time Saved", value: "12hrs/week" },
      { metric: "Uptime", value: "99.9%" }
    ],
    techStack: ["React", "Node.js", "MongoDB", "AWS S3", "Redis", "Stripe"],
    features: ["News Feed", "Event Calendar", "Member Directory", "LMS", "Job Board"]
  },
  {
    id: "green",
    title: "Green Lifestyle",
    category: "Blog",
    year: "2024",
    tagline: "Sustainable living, consciously crafted",
    description: "An eco-conscious content platform focused on sustainable living, featuring optimized article layouts, topic-based navigation, and a built-in sustainable product marketplace.",
    link: "https://devendrashahi.pythonanywhere.com/",
    thumbnail: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    color: "#4A7C59",
    services: ["Content Platform", "SEO Optimization", "Affiliate Integration", "Newsletter System"],
    challenges: [
      "Creating distraction-free reading experience",
      "Optimizing for search engines while maintaining design",
      "Monetization without compromising user experience",
      "Fast load times on slower connections"
    ],
    solutions: [
      "Designed typography-focused article templates with variable fonts",
      "Implemented semantic HTML with structured data markup",
      "Created non-intrusive affiliate links with clear disclosures",
      "Built offline-first PWA with service worker caching"
    ],
    results: [
      { metric: "Organic Traffic", value: "+180%" },
      { metric: "Read Time", value: "4.5min avg" },
      { metric: "Subscriber Rate", value: "8%" },
      { metric: "Core Web Vitals", value: "95+" }
    ],
    techStack: ["Django", "PostgreSQL", "Bootstrap", "Mailchimp", "AWS"],
    features: ["Article CMS", "Newsletter", "Product Reviews", "Topic Tags", "Dark Mode"]
  },
  {
    id: "studentstack",
    title: "StudentStack",
    category: "SaaS",
    year: "2025",
    tagline: "The all-in-one student productivity suite",
    description: "A comprehensive EdTech SaaS platform offering study planner, note-taking, group collaboration, and exam preparation tools designed specifically for university students.",
    link: "https://studentstack.vercel.app",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    color: "#6366F1",
    services: ["Product Design", "Full-Stack Development", "Real-time Features", "Analytics"],
    challenges: [
      "Real-time collaboration without overwhelming users",
      "Cross-device synchronization of study materials",
      "Gamification that actually drives engagement",
      "Handling peak load during exam seasons"
    ],
    solutions: [
      "Built presence indicators and cursor sharing with CRDT",
      "Implemented conflict-free sync with operational transforms",
      "Created meaningful rewards tied to actual study habits",
      "Designed auto-scaling infrastructure for seasonal spikes"
    ],
    results: [
      { metric: "Active Users", value: "12,000+" },
      { metric: "Study Hours", value: "50k+/month" },
      { metric: "Retention", value: "68%" },
      { metric: "NPS Score", value: "72" }
    ],
    techStack: ["Next.js", "Supabase", "Prisma", "Stripe", "Vercel Edge"],
    features: ["Study Planner", "Collaborative Notes", "Flashcards", "Analytics", "Study Groups"]
  },
  {
    id: "3am3d",
    title: "3am3d",
    category: "Creative",
    year: "2025",
    tagline: "Dreams rendered in three dimensions",
    description: "An immersive portfolio and booking platform for a 3D creative studio, featuring WebGL-powered showcases, interactive project galleries, and seamless client communication tools.",
    link: "https://3am3d.vercel.app",
    thumbnail: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80",
    color: "#8B5CF6",
    services: ["Creative Direction", "WebGL Development", "Portfolio Design", "Booking System"],
    challenges: [
      "Heavy 3D content without sacrificing performance",
      "Creating memorable interactive experiences",
      "Booking system with complex project scoping",
      "Portfolio that scales with growing project library"
    ],
    solutions: [
      "Implemented progressive loading with low-poly placeholders",
      "Built custom WebGL transitions and hover effects",
      "Created dynamic quote calculator based on project scope",
      "Designed modular portfolio grid with infinite scroll"
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
