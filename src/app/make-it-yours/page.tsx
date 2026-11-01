import { FoundationsExperience } from "@/app/make-it-yours/FoundationsExperience";
import { createMetadata } from "@/lib/seo";
import { getVisitorCurrency } from "@/lib/website-region";
import { isOfferPath, OfferPath } from "@/lib/website-offers";

export const metadata = createMetadata({
  title: "Make It Yours — Website Approaches | echo11",
  description:
    "Check whether your website requirements fit a Foundation or need a Custom build, compare the likely scope, and send a useful project brief.",
  path: "/make-it-yours",
});

interface MakeItYoursPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MakeItYoursPage({ searchParams }: MakeItYoursPageProps) {
  const [currency, params] = await Promise.all([getVisitorCurrency(), searchParams]);
  const pathParam = firstValue(params.path);
  const initialPath: OfferPath = isOfferPath(pathParam) ? pathParam : "foundation";

  return (
    <FoundationsExperience
      initialCurrency={currency}
      initialPath={initialPath}
      initialReference={firstValue(params.reference) || firstValue(params.claim)}
      tracking={{
        utmSource: firstValue(params.utm_source),
        utmMedium: firstValue(params.utm_medium),
        utmCampaign: firstValue(params.utm_campaign),
      }}
    />
  );
}
