"use client";

import { useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
import { submitWebsiteInquiry } from "@/lib/actions/website-inquiry-actions";
import { getBudgetOptions, TIMELINE_LABELS, TIMELINE_OPTIONS, type BudgetRange, type CurrencyCode, type InquiryResult, type InquiryTimeline, type OfferPath, type ProjectType, type WebsiteInquiryInput } from "@/lib/website-offers";
import { Button } from "@/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hostedInquiriesEnabled, InquiryEmailDraft } from "@/components/marketing/InquiryEmailDraft";

interface NextStepBriefProps {
  currency: CurrencyCode;
  offerPath: OfferPath;
  projectType: ProjectType;
  referenceProject: string;
  needsReview: boolean;
  tracking: { utmSource?: string; utmMedium?: string; utmCampaign?: string };
}
type Errors = NonNullable<InquiryResult["fieldErrors"]>;
const FIELD = "min-h-12 w-full border-b border-white/30 bg-transparent py-3 text-base text-white outline-none placeholder:text-white/55 focus:border-accent focus:ring-2 focus:ring-accent/30";

function Field({ id, label, error, optional = false, children }: { id: string; label: string; error?: string; optional?: boolean; children: ReactNode }) {
  return <div data-field={id} className="min-w-0 py-4">
    <label id={`${id}-label`} htmlFor={id} className="mb-2 block text-sm text-white/80">{label}{optional ? " (optional)" : " *"}</label>
    {children}
    {error && <p id={`${id}-error`} className="mt-2 text-sm text-red-200">{error}</p>}
  </div>;
}

export function NextStepBrief({ currency, offerPath, projectType, referenceProject, needsReview, tracking }: NextStepBriefProps) {
  const root = useRef<HTMLFormElement>(null);
  const busy = useRef(false);
  const [form, setForm] = useState({ goals: "", budgetRange: "" as BudgetRange | "", timeline: "" as InquiryTimeline | "", name: "", email: "", company: "", currentWebsite: "", website: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");
  const [sending, setSending] = useState(false);
  const [receipt, setReceipt] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<WebsiteInquiryInput | null>(null);
  const [budgetBasis, setBudgetBasis] = useState(`${offerPath}:${currency}:${needsReview}`);
  const basis = `${offerPath}:${currency}:${needsReview}`;
  const budgetStale = Boolean(form.budgetRange && budgetBasis !== basis);
  const budgetOptions = needsReview ? [{ value: "not-sure" as const, label: "Let's agree a budget after reviewing the scope" }] : getBudgetOptions(offerPath, currency);
  function update<Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) {
    setForm(current => ({ ...current, [key]: value }));
    setErrors(current => ({ ...current, [key]: undefined }));
    if (key === "budgetRange") setBudgetBasis(basis);
  }
  function focusError(next: Errors) {
    const order = ["goals", "budgetRange", "timeline", "name", "email", "company", "currentWebsite"] as const;
    const first = order.find(key => next[key]);
    requestAnimationFrame(() => {
      if (first) root.current?.querySelector<HTMLElement>(`[data-field="brief-${first}"] input, [data-field="brief-${first}"] textarea, [data-field="brief-${first}"] button`)?.focus();
    });
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const next: Errors = {};
    if (form.goals.trim().length < 20) next.goals = "Describe your audience, problem, and goal in at least 20 characters.";
    if (!form.budgetRange || budgetStale) next.budgetRange = "Choose a range for the current approach and currency.";
    if (!form.timeline) next.timeline = "Choose your preferred launch timing.";
    if (form.name.trim().length < 2) next.name = "Enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.company.trim().length < 2) next.company = "Enter your company, team, or project name.";
    if (Object.keys(next).length) { setErrors(next); focusError(next); return; }
    busy.current = true;
    setSending(true); setSubmitError(""); setErrors({});
    const input: WebsiteInquiryInput = { ...form, goals: `${form.goals}\n\nWebsite fit context: ${referenceProject}`, offerPath, projectType, currency, referenceProject: referenceProject.slice(0, 80), sourcePath: "/make-it-yours", budgetRange: form.budgetRange as BudgetRange, timeline: form.timeline as InquiryTimeline, ...tracking };
    try {
      if (!hostedInquiriesEnabled) { setEmailDraft(input); return; }
      const result = await submitWebsiteInquiry(input);
      if (!result.success) {
        setSubmitError(result.error || "Your brief could not be sent. Your answers are saved here; try again or email us.");
        setErrors(result.fieldErrors || {}); focusError(result.fieldErrors || {});
      } else { setReceipt(result.inquiryId || ""); }
    } catch {
      setSubmitError("The connection was interrupted. Your answers are still here. Try again or email us.");
    } finally { busy.current = false; setSending(false); }
  }
  const attrs = (key: keyof Errors) => ({ required: true, "aria-invalid": Boolean(errors[key]), "aria-describedby": errors[key] ? `brief-${key}-error` : undefined });
  if (emailDraft) return <InquiryEmailDraft inquiry={emailDraft} onEdit={() => setEmailDraft(null)} />;
  if (receipt !== null) return <div role="status" className="border-l-2 border-accent pl-6">
    <p className="font-mono text-xs uppercase tracking-widest text-accent">Brief received</p>
    <h3 className="mt-4 text-3xl font-semibold tracking-tight">Your next chapter starts with a conversation.</h3>
    <p className="mt-5 max-w-xl text-base leading-7 text-white/75">We’ll review your requested approach and reply by email. Final scope, cost, and delivery timing are confirmed together after review.</p>
    {receipt && <p className="mt-4 text-sm text-white/70">Your reference: {receipt.slice(0, 8)}</p>}
    <a className="mt-5 inline-flex min-h-11 items-center underline underline-offset-4" href="mailto:echo11.labs@gmail.com">echo11.labs@gmail.com</a>
  </div>;
  return <form ref={root} onSubmit={submit} noValidate className="relative">
    <p className="mb-3 text-sm text-white/75">{!hostedInquiriesEnabled && "Prepare your brief, then review and send it from your email app. Nothing is sent automatically. "}Fields marked * are required. {needsReview ? "We’ll agree a budget after reviewing your scope." : "Need help with budget? Choose “I need help setting a range.”"} If you have no launch deadline, choose “Timing is flexible.”</p>
    <div aria-hidden="true" className="sr-only"><label htmlFor="brief-honeypot">Website</label><input id="brief-honeypot" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => update("website", e.target.value)} /></div>
    {Object.values(errors).some(Boolean) && <p role="alert" className="mb-4 border-l-2 border-red-300 pl-4 text-sm text-red-200">Please check the highlighted fields. Your brief has not been sent.</p>}
    <fieldset disabled={sending} className="min-w-0">
      <legend className="sr-only">Your project brief</legend>
      <Field id="brief-goals" label="What would a better website make possible?" error={errors.goals}><textarea id="brief-goals" className={`${FIELD} min-h-32 resize-y`} placeholder="Who it is for, what is not working, and the outcome you want." minLength={20} maxLength={4000} value={form.goals} onChange={e => update("goals", e.target.value)} {...attrs("goals")} /></Field>
      <div className="grid gap-x-8 sm:grid-cols-2">
        <Field id="brief-budgetRange" label={`Budget (${currency})`} error={errors.budgetRange}>
          {budgetStale && <p id="budget-change" className="mb-2 text-sm text-accent">Your approach or currency changed. Please confirm the range again.</p>}
          <Select required value={budgetStale ? undefined : form.budgetRange || undefined} onValueChange={v => update("budgetRange", v as BudgetRange)}><SelectTrigger className="data-[placeholder]:text-white/65" id="brief-budgetRange" aria-labelledby="brief-budgetRange-label" aria-required="true" aria-invalid={Boolean(errors.budgetRange)} aria-describedby={errors.budgetRange ? "brief-budgetRange-error" : budgetStale ? "budget-change" : undefined}><SelectValue placeholder="Choose a range">{!budgetStale && budgetOptions.find(o => o.value === form.budgetRange)?.label}</SelectValue></SelectTrigger><SelectContent>{budgetOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select>
        </Field>
        <Field id="brief-timeline" label="Preferred launch timing" error={errors.timeline}><Select required value={form.timeline || undefined} onValueChange={v => update("timeline", v as InquiryTimeline)}><SelectTrigger className="data-[placeholder]:text-white/65" id="brief-timeline" aria-labelledby="brief-timeline-label" aria-required="true" aria-invalid={Boolean(errors.timeline)} aria-describedby={errors.timeline ? "brief-timeline-error" : "timing-note"}><SelectValue placeholder="Choose timing">{form.timeline && TIMELINE_LABELS[form.timeline]}</SelectValue></SelectTrigger><SelectContent>{TIMELINE_OPTIONS.map(v => <SelectItem key={v} value={v}>{TIMELINE_LABELS[v]}</SelectItem>)}</SelectContent></Select><p id="timing-note" className="mt-2 text-sm leading-6 text-white/70">A preference, not a reserved launch date. We confirm availability after review.</p></Field>
        <Field id="brief-name" label="Your name" error={errors.name}><input id="brief-name" className={FIELD} autoComplete="name" maxLength={120} value={form.name} onChange={e => update("name", e.target.value)} {...attrs("name")} /></Field>
        <Field id="brief-email" label="Email" error={errors.email}><input id="brief-email" type="email" className={FIELD} autoComplete="email" placeholder="you@company.com" maxLength={320} value={form.email} onChange={e => update("email", e.target.value)} {...attrs("email")} /></Field>
        <Field id="brief-company" label="Company, team, or project" error={errors.company}><input id="brief-company" className={FIELD} autoComplete="organization" maxLength={160} value={form.company} onChange={e => update("company", e.target.value)} {...attrs("company")} /></Field>
        <Field id="brief-currentWebsite" label="Current website" optional error={errors.currentWebsite}><input id="brief-currentWebsite" className={FIELD} autoComplete="url" inputMode="url" placeholder="company.com" value={form.currentWebsite} onChange={e => update("currentWebsite", e.target.value)} aria-invalid={Boolean(errors.currentWebsite)} aria-describedby={errors.currentWebsite ? "brief-currentWebsite-error" : undefined} /></Field>
      </div>
    </fieldset>
    {submitError && <p role="alert" className="mt-6 border-l-2 border-red-300 pl-4 text-base leading-7 text-red-200">{submitError} <a className="underline" href="mailto:echo11.labs@gmail.com">Email Echo11</a></p>}
    <div className="mt-8 flex flex-col gap-6 border-t border-white/20 pt-6 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-md text-sm leading-6 text-white/70">Echo11 may contact you about this project. Read our <Link className="underline underline-offset-4" href="/privacy">privacy policy</Link>.</p><Button type="submit" size="lg" disabled={sending}>{sending ? <><LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" />Sending</> : <>{hostedInquiriesEnabled ? "Send your brief" : "Prepare email brief"}<ArrowUpRight aria-hidden="true" className="ml-3 h-4 w-4" /></>}</Button></div>
  </form>;
}
