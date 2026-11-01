import Link from "next/link";
import { LegalDocument, legalLinkStyle, type LegalSection } from "@/components/marketing/LegalDocument";

const sections: LegalSection[] = [
  {
    id: "agreement",
    title: "These terms & your project agreement",
    content: <>
      <p>Echo11 is a website studio. These terms describe use of our website and the general framework for working with us. If you use an account on behalf of an organisation, you must have authority to act for that organisation.</p>
      <p>Paid work is governed by an accepted proposal, statement of work or signed project agreement. That document sets the deliverables, fees, schedule and project-specific conditions. Where it conflicts with these general terms, the project agreement takes priority, subject to applicable law.</p>
      <p>Browsing our work, using the fit check or sending a brief does not book a project, reserve availability or authorise a payment. We confirm the scope and commercial terms before a project begins.</p>
    </>,
  },
  {
    id: "services",
    title: "Scope, approaches & estimates",
    content: <>
      <p>Our services include website strategy, interface design, development and agreed optimisation or support. Only work listed in the project agreement is included.</p>
      <p>Foundation adapts an established page system for public website and product storytelling. Custom work is scoped around specific requirements. Cart, checkout, inventory, private tools and full applications require separate scoping or review; selecting a visual direction does not include those features automatically.</p>
      <p>Published starting prices and typical delivery windows are indicative, not fixed quotes or guaranteed dates. The proposal confirms the currency, taxes, third-party costs, exclusions and availability for your project.</p>
    </>,
  },
  {
    id: "responsibilities",
    title: "What we need from you",
    content: <>
      <ul className="list-disc space-y-3 pl-5 marker:text-muted-foreground">
        <li>Appoint a contact who can coordinate feedback and authorise decisions.</li>
        <li>Provide accurate requirements, content and necessary access through an agreed secure channel.</li>
        <li>Ensure you have permission to use supplied copy, images, fonts, trademarks and other materials.</li>
        <li>Review deliverables and provide consolidated feedback at the agreed stages.</li>
        <li>Meet the payment schedule and flag changes to priorities or dependencies promptly.</li>
      </ul>
      <p>You remain responsible for the accuracy and legality of your business claims, products and published content. Tell us about accessibility, privacy, regulatory or industry requirements during scoping so we can agree how they will be addressed.</p>
    </>,
  },
  {
    id: "payment",
    title: "Fees, invoices & outside costs",
    content: <>
      <p>The project agreement and invoices specify the payment milestones, any deposit, due dates and currency. A starting price on the website does not replace those terms.</p>
      <p>Hosting, domains, paid fonts, stock assets, software subscriptions and other third-party charges are included only if expressly stated. Responsibility for purchasing and renewing them should be confirmed before launch.</p>
      <p>Any late-payment charges, suspension rights or refund conditions must be set out in the agreement and comply with applicable law. If an invoice is disputed or a payment is delayed, contact us promptly to resolve it and confirm the effect on the schedule.</p>
    </>,
  },
  {
    id: "revisions",
    title: "Feedback & changes to scope",
    content: <>
      <p>Included revisions and review stages are defined in the project agreement. Feedback within that scope is part of the agreed process.</p>
      <p>New pages, functionality, integrations or changes to an approved direction may affect the price and schedule. We confirm the additional work and its implications in writing before proceeding. A request for a change does not by itself approve an extra charge.</p>
    </>,
  },
  {
    id: "timeline",
    title: "Scheduling, review & launch",
    content: <>
      <p>Delivery depends on the agreed scope, content readiness, access, approvals and third-party dependencies. Delayed inputs or changes may require a revised schedule; we communicate the impact and confirm the next steps.</p>
      <p>Review and acceptance criteria belong in the project agreement. Before launch, you review the agreed deliverables and confirm business content and release approval. We do not treat silence as automatic acceptance unless an applicable, agreed review process expressly provides for it.</p>
      <p>Moving a site live can depend on domain, hosting and external-service access. Those dependencies should be resolved with the responsible account owner before release.</p>
    </>,
  },
  {
    id: "ip",
    title: "Ownership, licences & handover",
    content: <>
      <p>The project agreement identifies the final custom deliverables you will own, when rights transfer and what is included in handover. Unless the agreement states otherwise, transfer of agreed custom deliverables is conditional on full payment for that work.</p>
      <p>Pre-existing systems, reusable components, tools and third-party materials are not automatically transferred as exclusive property. Where they form part of your website, the agreement and relevant licences define your rights to use them. Open-source and commercial software retain their own licence conditions.</p>
      <p>Your supplied materials remain yours or their original owner’s. You permit us to use them for the agreed project. Unselected concepts, drafts and working files are included only where specified.</p>
      <p>Account access, source files, documentation and any ongoing licences should be identified in the handover scope. Portfolio display or case-study permission is addressed in the project agreement; confidential materials are not made public merely because a project is completed.</p>
    </>,
  },
  {
    id: "support",
    title: "After launch & third-party services",
    content: <>
      <p>Post-launch corrections, maintenance, hosting, backups and ongoing improvements are included only to the extent stated in the project agreement or a separate support arrangement. Handover does not automatically create an ongoing maintenance subscription.</p>
      <p>External platforms and providers have their own terms, charges and availability. Changes to their services can affect a website or integration. Any adaptation or additional support is handled under the agreed scope.</p>
    </>,
  },
  {
    id: "website",
    title: "Website, accounts & showcase use",
    content: <>
      <p>You may browse our portfolio and use the website to explore our services. Do not misuse account access, attempt unauthorised entry, disrupt the service, upload malicious material or use the website for unlawful activity. Keep account details secure and report suspected misuse.</p>
      <p>Our site design, artwork, copy and showcase assets are not offered for resale or copying as your own. Client marks and third-party materials belong to their respective owners.</p>
      <p>FORGE, LALTIN and other labelled studio concepts demonstrate design and development directions. They are not offers to purchase an operating business, template or its assets. Sample restaurant menus, locations and other concept details are illustrative. External project links are governed by their operators’ terms.</p>
    </>,
  },
  {
    id: "confidentiality",
    title: "Confidentiality & personal information",
    content: <>
      <p>Project-specific confidentiality duties, permitted disclosures and any non-disclosure agreement are set out in the project agreement. Do not send confidential credentials or sensitive records through the public inquiry form.</p>
      <p>Our <Link href="/privacy" className={legalLinkStyle}>Privacy Policy</Link> explains how we handle inquiries, account records and communications. If a project involves processing personal information on your behalf, the necessary responsibilities and instructions must be agreed as part of that scope.</p>
    </>,
  },
  {
    id: "warranties",
    title: "Service standards & outcomes",
    content: <>
      <p>We undertake agreed services with reasonable skill and care. Any specific warranty, correction period or service level is described in the project agreement.</p>
      <p>Design and development cannot guarantee a particular sales result, conversion rate, search ranking or uninterrupted third-party service. Portfolio examples illustrate completed work or concepts; they are not promises that every project will achieve identical results.</p>
      <p>Nothing on this page excludes a warranty, remedy or protection that applicable law does not allow us to exclude.</p>
    </>,
  },
  {
    id: "liability",
    title: "Responsibility & applicable protections",
    content: <>
      <p>Responsibility for project risks, any limitation of liability and the remedies available to each party are addressed in the project agreement. They apply only to the extent permitted by law.</p>
      <p>These general terms do not remove mandatory consumer protections or other rights that cannot legally be waived. A project agreement cannot override those protections either.</p>
    </>,
  },
  {
    id: "termination",
    title: "Pausing or ending a project",
    content: <>
      <p>Notice periods, cancellation rights, payment for completed work, treatment of deposits and delivery of paid-for materials are governed by the project agreement and applicable law. This page does not impose a universal non-refundable deposit or cancellation fee.</p>
      <p>If a project needs to pause or end, contact us in writing. We confirm the status of the work, outstanding obligations, access and handover arrangements. Confidentiality and other obligations intended to continue remain subject to the agreement.</p>
    </>,
  },
  {
    id: "governing",
    title: "Questions, disputes & updates",
    content: <>
      <p>Raise a concern with the studio first, with enough information for us to understand the issue and relevant agreement. We seek to resolve it through a direct conversation. This does not prevent you from using legal remedies available to you.</p>
      <p>Project agreements identify any governing-law and dispute-resolution provisions. Applicable laws and any mandatory protections relevant to the transaction continue to apply. This page does not require mandatory arbitration or waive access to a competent court.</p>
      <p>The revision date above records changes to these general terms. A website update does not by itself change an existing signed project agreement; changes to that agreement follow its amendment process.</p>
    </>,
  },
];

export function TermsContent() {
  return <LegalDocument
    name="Terms of service"
    sections={sections}
    overviewTitle="Before we begin"
    overviewAction={{ href: "#agreement", label: "How agreements work" }}
    overviewNote="This overview is a reading aid. The full terms and your accepted project agreement explain the details."
    summary={[
      { title: "An inquiry starts a conversation.", text: "Sending a brief helps us assess the work. It does not reserve a project or commit you to a fee." },
      { title: "The scope comes first.", text: "Deliverables, payment milestones and review stages are agreed before work begins." },
      { title: "A handover with clear rights.", text: "Your agreement identifies custom deliverables, licences, access and what happens after launch." },
    ]}
    related={{ href: "/privacy", label: "Privacy policy" }}
    contactTitle="Let’s clarify it before we begin."
    contactText="For questions about these terms, contact Echo11. If your question concerns an existing project, include its name or agreement reference."
    emailSubject="Terms of service question"
  />;
}
