import { PageWrapper } from "@/components/layout/PageWrapper";
import { ContactExperience } from "@/app/contact/ContactExperience";
import { getVisitorCurrency } from "@/lib/website-region";
import {
  isOfferPath,
  isProjectType,
  OfferPath,
  ProjectType,
} from "@/lib/website-offers";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Start a project | echo11",
  description:
    "Tell us about your ambition, the problem to solve, and what a successful website needs to achieve. Share your project brief with Echo11 and find a clear next step for strategy, design and development.",
  path: "/contact",
});

interface ContactPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [currency, params] = await Promise.all([getVisitorCurrency(), searchParams]);
  const pathParam = firstValue(params.path);
  const projectParam = firstValue(params.project);
  const defaultOffer: OfferPath = isOfferPath(pathParam) ? pathParam : "custom";
  const defaultProjectType: ProjectType = isProjectType(projectParam) ? projectParam : "service";
  const referenceProject = firstValue(params.reference) || firstValue(params.claim);
  const utmSource = firstValue(params.utm_source);
  const utmMedium = firstValue(params.utm_medium);
  const utmCampaign = firstValue(params.utm_campaign);

  return (
    <PageWrapper>
      <ContactExperience
        initialCurrency={currency}
        defaultOffer={defaultOffer}
        defaultProjectType={defaultProjectType}
        referenceProject={referenceProject}
        sourcePath="/contact"
        tracking={{
          utmSource,
          utmMedium,
          utmCampaign,
        }}
      />
    </PageWrapper>
  );
}
