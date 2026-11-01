import { type OfferPath, type ProjectType } from "@/lib/website-offers";

export interface FitAnswers {
  projectType: ProjectType | "unsure" | "";
  interaction: "public" | "commerce" | "accounts" | "unsure" | "";
  content: "pages" | "library" | "complex" | "unsure" | "";
  integrations: "none" | "simple" | "connected" | "unsure" | "";
  migration: "light" | "substantial" | "unsure" | "";
}
export interface FitOption { value: string; label: string; detail: string }
export const FIT_OPTIONS: Record<keyof FitAnswers, FitOption[]> = {
  projectType: [
    { value: "service", label: "Service or marketing website", detail: "Explain an offer and start conversations." },
    { value: "ecommerce", label: "Product brand or online store", detail: "Showcase products; we’ll ask separately about checkout." },
    { value: "saas", label: "SaaS or product marketing", detail: "Market the product, rather than build the application itself." },
    { value: "web-app", label: "Web app or platform", detail: "Build the actual software or an operational tool." },
    { value: "other", label: "Something else", detail: "Describe the business in your brief." },
    { value: "unsure", label: "Not sure yet", detail: "We can help clarify the right scope." },
  ],
  interaction: [
    { value: "public", label: "Explore and contact us", detail: "Public pages, enquiries, demos, or links to an existing store." },
    { value: "commerce", label: "Buy on this website", detail: "Include cart, checkout, payments, or store operations." },
    { value: "accounts", label: "Sign in and use private tools", detail: "Accounts, dashboards, or an operational workflow." },
    { value: "unsure", label: "Not sure yet", detail: "Let’s discuss what the audience needs to do." },
  ],
  content: [
    { value: "pages", label: "A focused set of pages", detail: "Core business pages or a small product showcase, without checkout." },
    { value: "library", label: "A growing library", detail: "Articles, case studies, or repeatable public product pages." },
    { value: "complex", label: "Custom content or data", detail: "Content relationships, permissions, or bespoke publishing tools." },
    { value: "unsure", label: "Not sure yet", detail: "We’ll map the content together." },
  ],
  integrations: [
    { value: "none", label: "No external connection", detail: "The website works independently." },
    { value: "simple", label: "One standard connection", detail: "For example, a booking embed or enquiry destination." },
    { value: "connected", label: "Several connected systems", detail: "For example, CRM, inventory, or automation sharing data." },
    { value: "unsure", label: "Not sure yet", detail: "We’ll review what needs to connect." },
  ],
  migration: [
    { value: "light", label: "New site or a simple move", detail: "A new start or straightforward transfer of existing pages." },
    { value: "substantial", label: "A substantial migration", detail: "A large content archive, complex redirects, or changing platforms." },
    { value: "unsure", label: "Not sure yet", detail: "We’ll inspect the current site before confirming scope." },
  ],
};
export function fitLabel(key: keyof FitAnswers, value: string) {
  return FIT_OPTIONS[key].find(option => option.value === value)?.label || "Not answered";
}
export function getRecommendation(answers: FitAnswers, requested: OfferPath) {
  const reasons: string[] = [];
  const application = answers.projectType === "web-app" || answers.interaction === "accounts";
  if (answers.interaction === "commerce") reasons.push("Checkout and store operations need a separately scoped commerce build.");
  if (answers.content === "complex") reasons.push("Your content needs custom relationships, access rules, or publishing tools.");
  if (answers.integrations === "connected") reasons.push("Several systems need to share data.");
  if (answers.migration === "substantial") reasons.push("Your migration needs its own plan.");
  if (requested === "custom") reasons.push("You prefer a website planned and designed from the ground up.");
  const uncertain = Object.values(answers).some(value => value === "unsure");
  const path: OfferPath = application || reasons.length ? "custom" : "foundation";
  if (application) reasons.unshift("An application or private workflow sits outside the published marketing-website offers.");
  if (uncertain) reasons.push("Some requirements are undecided; we’ll confirm them with you before recommending a final scope.");
  if (!reasons.length) reasons.push("You need public pages with straightforward content and few or no connections to other systems.");
  return { path, reasons, application, needsReview: application || uncertain, uncertain };
}
