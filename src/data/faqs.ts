export interface FaqItem {
  q: string;
  a: string;
}

export const faqs: FaqItem[] = [
  {
    q: "What is your typical project size and timeline?",
    a: "Most of our engagements run between 4 and 12 weeks, depending on the scope and technical complexity. We define clear milestones and timeline ranges during the initial discovery phase so you know what to expect before work begins.",
  },
  {
    q: "How do you price your engagements?",
    a: "We price based on clear, agreed-upon scope rather than open-ended hourly billing. This means you know the investment required upfront to reach specific business outcomes. We don't add surprises mid-project without an explicit scope conversation.",
  },
  {
    q: "What is included in a standard project scope?",
    a: "A typical scope covers product planning, interface design, frontend and backend engineering, QA, launch support, and technical hand-off documentation. The exact mix depends on your starting point and what you need from us.",
  },
  {
    q: "Do you work with existing codebases or only start from scratch?",
    a: "We do both. For existing systems, we begin with a technical audit to identify risks and stabilize critical areas before incrementally improving the product — without disrupting what is already working.",
  },
  {
    q: "How do you handle project communication and updates?",
    a: "You receive regular progress updates, access to staging environments for review, and clear communication when technical risks or scope adjustments emerge. We believe transparent delivery is part of the product.",
  },
  {
    q: "What technologies do you specialize in?",
    a: "Our core stack is built around Next.js, React, TypeScript, Node.js, and PostgreSQL. We choose modern, proven tools that prioritize performance, security, and long-term maintainability — not whatever is trending.",
  },
  {
    q: "Can you design the product, or do we need to provide designs?",
    a: "We handle UX and UI design in-house. We ensure the interface is both visually credible and technically feasible, and that it aligns with your business goals rather than just looking good in isolation.",
  },
  {
    q: "Do you offer ongoing maintenance and support after launch?",
    a: "Yes. We offer support retainers that cover security updates, performance monitoring, bug fixes, and prioritized feature additions to keep your product stable and improving after the initial launch.",
  },
  {
    q: "How do you ensure the product is secure and scalable?",
    a: "Security and scalability are built into the architecture from the start — not added as an afterthought. We implement robust authentication patterns, secure data handling, and scalable database schemas from day one.",
  },
  {
    q: "What is the next step to get started?",
    a: "It starts with understanding your goals and constraints. Reach out via the contact form with your project details, and we will respond with a clear next step — usually a focused scope conversation within 24 hours.",
  },
];
