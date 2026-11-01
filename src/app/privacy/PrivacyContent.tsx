import type { ReactNode } from "react";
import { LegalDocument, legalLinkStyle as linkStyle, type LegalSection } from "@/components/marketing/LegalDocument";

const email = "echo11.labs@gmail.com";
const sections: LegalSection[] = [
  {
    id: "scope", title: "Who this policy is for",
    content: <><p>Echo11 is a website studio. This policy covers personal information handled through our website, project inquiries, client workspace and communications with the studio.</p><p>Websites we build for clients may have their own privacy policies. When we handle information on a client’s behalf, their instructions and our agreement govern that work. This policy does not replace their policy.</p></>,
  },
  {
    id: "collection", title: "Information we collect",
    content: <><dl className="space-y-6"><PolicyItem title="When you start a project">The public brief builder currently prepares an email for you to review and send. Preparing it does not submit the brief to our database or inbox; we receive it when you send the email. Your brief can contain your name, email, organisation, current website if provided, project type, preferred approach, goals, budget, timing and chosen currency. An inquiry can also include a selected reference project, the page it came from, campaign parameters in its link and a country code supplied by our hosting infrastructure.</PolicyItem><PolicyItem title="When you use a workspace">Account and profile details, project communications, uploaded files, approvals, contracts, invoices and activity associated with your account or project.</PolicyItem><PolicyItem title="When you contact us directly">Your contact details, message and any attachments or information you choose to share by email or another communication channel.</PolicyItem><PolicyItem title="When you browse">Browser preferences described below. Infrastructure providers may also process technical request data, such as IP addresses, browser information and error logs, to deliver and protect the service.</PolicyItem></dl><p>Please share only what is needed for the conversation. Do not put passwords, payment-card details or sensitive personal records in a project inquiry.</p></>,
  },
  {
    id: "usage", title: "Why we use it",
    content: <><ul className="list-disc space-y-3 pl-5 marker:text-muted-foreground"><li>Review your requirements, respond to your inquiry and prepare a scope or proposal.</li><li>Manage accounts, deliver agreed work, coordinate feedback and provide support.</li><li>Send project and account messages, maintain contracts and administer invoices.</li><li>Remember preferences, troubleshoot problems and prevent abuse or duplicate submissions.</li><li>Keep records required for legal, accounting or dispute-resolution purposes.</li></ul><p>Submitting an inquiry lets us respond about that inquiry. It does not subscribe you to a newsletter. If we introduce another use that requires consent, we will explain it and seek that consent.</p></>,
  },
  {
    id: "sharing", title: "Who information is shared with",
    content: <><p>Information passes through services that support the work. Our website uses Supabase for database storage and account authentication, and Resend to deliver email notifications. Inquiry notifications are sent to the studio’s email inbox. Hosting, file-storage and email providers also process information needed to operate their services.</p><p>Within a client workspace, information may be visible to authorised studio staff and members of the relevant project or organisation. Access depends on the workspace and role.</p><p>We may disclose relevant information to professional advisers or where required or permitted by law, including to respond to a valid legal request or protect rights and safety. We do not sell personal information.</p></>,
  },
  {
    id: "international", title: "International processing",
    content: <><p>Service providers may store or process information in a different country from where you live. Information processed in another country may be subject to that country’s laws and accessible to its courts, law enforcement or other authorities.</p><p>Contact us if you need to understand the processing arrangements for a particular project before sharing information.</p></>,
  },
  {
    id: "cookies", title: "Cookies & browser storage",
    content: <><p>Cookies and browser storage support preferences and account functionality. They serve different purposes:</p><dl className="divide-y divide-border border-y border-border"><StorageItem name="Currency preference" detail="The echo11_currency cookie remembers the currency selected for website pricing." duration="Up to one year, unless you clear it sooner."/><StorageItem name="Account session" detail="Supabase authentication cookies support sign-in and session renewal for account areas." duration="Lifetime depends on the account session and authentication settings."/><StorageItem name="Introduction animation" detail="Session storage remembers that the opening animation has already been shown." duration="For the browser tab’s session."/><StorageItem name="Workspace guidance" detail="Local storage remembers onboarding and tour choices in the internal workspace." duration="Until cleared or reset by the application."/></dl><p>You can clear or block cookies and storage in your browser. Preferences may reset, and blocking authentication cookies can prevent sign-in. The public website does not include advertising pixels in its current implementation.</p></>,
  },
  {
    id: "retention", title: "How long information is kept",
    content: <><p>Retention depends on the purpose of the record: following up on an inquiry, delivering a project, maintaining an account, meeting legal or accounting requirements, or resolving a dispute. Different records may need different retention periods.</p><p>You can ask us what we hold and request deletion of information that is no longer needed. Some records may need to be retained where the law or an ongoing obligation requires it; deletion from backup systems may take longer than deletion from active systems.</p></>,
  },
  {
    id: "security", title: "Protecting information",
    content: <><p>Account areas use authentication and role-based access controls. Project access is limited according to the account and workspace permissions. These controls help restrict who can view or change information.</p><p>No online service can guarantee complete security. Keep your sign-in details private and tell us promptly if you suspect unauthorised access or an information-security issue.</p></>,
  },
  {
    id: "rights", title: "Your choices & requests",
    content: <><p>Subject to applicable law, you can ask to access personal information we hold about you, correct inaccuracies, request deletion, or withdraw consent to a use that relies on consent. Withdrawing consent may affect services that need that information.</p><p>Email <a className={linkStyle} href={`mailto:${email}?subject=Privacy%20request`}>{email}</a> with the request and enough context to locate your record, such as the email used for an inquiry or account. We may need to verify your identity before providing information or making changes. Do not send identity documents with your initial message.</p><p>We will explain any applicable limits, required retention or reasons we cannot fulfil a request. You can also raise a concern with the privacy regulator that applies to your situation.</p></>,
  },
  {
    id: "third-party", title: "External sites & other visitors",
    content: <><p>Portfolio links and other external resources take you to services with their own privacy practices. Externally loaded media can also send technical request information to the service hosting it. Review the relevant provider’s policy when using those services.</p><p>Our services are intended for businesses and project teams, rather than children. If you believe a child has shared personal information with us, contact us so we can review it.</p></>,
  },
  {
    id: "changes", title: "Updates to this policy",
    content: <><p>We update this page when our services or information-handling practices change. The date above identifies the latest revision. Where applicable law requires additional notice or consent for a change, that requirement also applies.</p></>,
  },
];

function PolicyItem({ title, children }: { title: string; children: ReactNode }) {
  return <div><dt className="mb-2 font-medium text-foreground">{title}</dt><dd>{children}</dd></div>;
}

function StorageItem({ name, detail, duration }: { name: string; detail: string; duration: string }) {
  return <div className="grid gap-2 py-5 sm:grid-cols-[150px_1fr] sm:gap-5"><dt className="font-medium text-foreground">{name}</dt><dd><p>{detail}</p><p className="mt-2 text-sm text-muted-foreground">{duration}</p></dd></div>;
}

export function PrivacyContent() {
  return <LegalDocument
    name="Privacy policy"
    sections={sections}
    overviewTitle="The policy at a glance"
    overviewAction={{ href: "#rights", label: "Make a privacy request" }}
    overviewNote="This overview is a reading aid. The full policy below explains the details and applicable limits."
    summary={[
      { title: "Information with a purpose.", text: "Your brief and contact details help us understand the work and respond to you." },
      { title: "Services behind the scenes.", text: "Database, account and email providers support inquiries and project delivery." },
      { title: "A direct way to ask.", text: "Contact the studio to access, correct or request deletion of your information." },
    ]}
    related={{ href: "/terms", label: "Terms of service" }}
    contactTitle="A question about your information?"
    contactText="Contact Echo11. Use “Privacy request” in the subject so we can identify the purpose of your message."
    emailSubject="Privacy request"
  />;
}
