import { Hero } from "@/components/sections/Hero";
import { TrustSnapshot } from "@/components/sections/TrustSnapshot";
import { ServicesGrid } from "@/components/sections/ServicesGrid";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { ProcessTimeline } from "@/components/sections/ProcessTimeline";
import { FAQ } from "@/components/sections/FAQ";
import { CTABanner } from "@/components/sections/CTABanner";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { faqJsonLd } from "@/lib/seo";
import { faqs } from "@/data/faqs";
import { ServiceBand } from "@/components/ui/logo-cloud-4";
import { 
  Globe, 
  Users, 
  AppWindow, 
  ShoppingCart, 
  Newspaper, 
  Smartphone, 
  Network, 
  Waypoints, 
  Database, 
  PenTool, 
  Bot, 
  GraduationCap 
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Echo11 - Digital Product Agency",
  description: "A premium digital product agency building robust software, websites, and data platforms for businesses worldwide.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

const services = [
  { name: "Websites", icon: Globe },
  { name: "Client Portals", icon: Users },
  { name: "Internal Platforms", icon: AppWindow },
  { name: "Commerce", icon: ShoppingCart },
  { name: "Publishing", icon: Newspaper },
  { name: "Mobile Apps", icon: Smartphone },
  { name: "System Architecture", icon: Network },
  { name: "API Integration", icon: Waypoints },
  { name: "Data Pipelines", icon: Database },
  { name: "UI/UX Design", icon: PenTool },
  { name: "Automation", icon: Bot },
  { name: "Education Tools", icon: GraduationCap }
];

export default function Home() {
  const faqSchema = faqJsonLd(faqs.map((f) => ({ q: f.q, a: f.a })));

  return (
    <PageWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Hero />
      <div className="w-full flex flex-col items-center pb-8 pt-8 bg-black">
        <ServiceBand items={services} />
      </div>
      <TrustSnapshot />
      <ServicesGrid />
      <SelectedWork />
      <ProcessTimeline />
      <FAQ />
      <CTABanner />
    </PageWrapper>
  );
}