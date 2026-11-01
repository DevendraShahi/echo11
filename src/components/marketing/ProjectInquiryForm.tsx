"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { submitWebsiteInquiry } from "@/lib/actions/website-inquiry-actions";
import {
  BudgetRange,
  CurrencyCode,
  formatOfferPrice,
  getBudgetOptions,
  InquiryResult,
  InquiryTimeline,
  OfferPath,
  OFFERS,
  PROJECT_TYPE_LABELS,
  PROJECT_TYPES,
  ProjectType,
  TIMELINE_LABELS,
  TIMELINE_OPTIONS,
  WebsiteInquiryInput,
} from "@/lib/website-offers";
import { CurrencySwitcher } from "@/components/marketing/CurrencySwitcher";
import { hostedInquiriesEnabled, InquiryEmailDraft } from "@/components/marketing/InquiryEmailDraft";

export interface ProjectInquiryFormProps {
  initialCurrency: CurrencyCode;
  currency?: CurrencyCode;
  onCurrencyChange?: (currency: CurrencyCode) => void;
  defaultOffer?: OfferPath;
  defaultProjectType?: ProjectType;
  referenceProject?: string;
  sourcePath: string;
  tracking?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };
  heading?: string;
  description?: string;
}

type FieldErrors = NonNullable<InquiryResult["fieldErrors"]>;

const LABEL = "font-mono text-[10px] uppercase tracking-[0.18em] text-white/60";

export function ProjectInquiryForm({
  initialCurrency,
  currency: controlledCurrency,
  onCurrencyChange,
  defaultOffer = "custom",
  defaultProjectType = "service",
  referenceProject,
  sourcePath,
  tracking,
  heading = "A little context. A clearer next step.",
  description = "Three parts to a useful first conversation. Short answers are welcome.",
}: ProjectInquiryFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);
  const [budgetNotice, setBudgetNotice] = useState("");
  const [internalCurrency, setInternalCurrency] = useState(initialCurrency);
  const currency = controlledCurrency ?? internalCurrency;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [inquiryId, setInquiryId] = useState("");
  const [emailDraft, setEmailDraft] = useState<WebsiteInquiryInput | null>(null);
  useEffect(() => { if (isSuccess) receiptRef.current?.focus(); }, [isSuccess]);

  const [form, setForm] = useState({
    offerPath: defaultOffer,
    projectType: defaultProjectType,
    name: "",
    email: "",
    company: "",
    currentWebsite: "",
    budgetRange: "" as BudgetRange | "",
    timeline: "" as InquiryTimeline | "",
    goals: "",
    referenceProject: referenceProject || "",
    website: "", // honeypot
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      offerPath: defaultOffer,
      projectType: defaultProjectType,
      budgetRange: current.offerPath === defaultOffer ? current.budgetRange : "",
      referenceProject: referenceProject || current.referenceProject,
    }));
  }, [defaultOffer, defaultProjectType, referenceProject]);

  const budgetOptions = useMemo(
    () => getBudgetOptions(form.offerPath, currency),
    [currency, form.offerPath]
  );

  const changeCurrency = (nextCurrency: CurrencyCode) => {
    if (nextCurrency === currency) return;
    if (form.budgetRange) { setValue("budgetRange", ""); setBudgetNotice("Currency changed. Please choose your budget range again."); }
    if (onCurrencyChange) onCurrencyChange(nextCurrency);
    else setInternalCurrency(nextCurrency);
  };

  const setValue = <Key extends keyof typeof form>(key: Key, value: (typeof form)[Key]) => {
    setForm((current) => ({ ...current, [key]: value, ...(key === "offerPath" && value !== current.offerPath ? { budgetRange: "" as const } : {}) }));
    if (key === "offerPath" && value !== form.offerPath && form.budgetRange) setBudgetNotice("Approach changed. Please choose your budget range again.");
    if (key === "budgetRange") setBudgetNotice("");
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    if (submitError) setSubmitError("");
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (form.goals.trim().length < 20) errors.goals = "Tell us a little more about the outcome you need (at least 20 characters).";
    if (!form.offerPath) errors.offerPath = "Select a starting route.";
    if (!form.projectType) errors.projectType = "Select what we are building.";
    if (form.name.trim().length < 2) errors.name = "Please provide your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please provide a valid work email.";
    }
    if (form.company.trim().length < 2) errors.company = "Please provide your company or brand name.";
    if (!form.budgetRange) errors.budgetRange = "Select an investment tier.";
    if (!form.timeline) errors.timeline = "Select your target launch timeframe.";
    if (form.goals.trim().length < 20) {
      errors.goals = "Please share at least a short sentence (20 characters) describing your project.";
    }
    return errors;
  };

  const focusError = (errors: FieldErrors) => {
    const field = formRef.current?.querySelector<HTMLElement>("[data-field='" + ["goals", "projectType", "offerPath", "budgetRange", "timeline", "name", "email", "company", "currentWebsite"].find(key => errors[key as keyof FieldErrors]) + "']");
    field?.focus();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const errors = validate();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      focusError(errors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setFieldErrors({});

    try {
      const payload: WebsiteInquiryInput = {
        offerPath: form.offerPath,
        projectType: form.projectType,
        name: form.name.trim(),
        email: form.email.trim(),
        company: form.company.trim(),
        currentWebsite: form.currentWebsite.trim() || undefined,
        budgetRange: form.budgetRange as BudgetRange,
        timeline: form.timeline as InquiryTimeline,
        goals: form.goals.trim(),
        currency,
        referenceProject: form.referenceProject.trim() || undefined,
        website: form.website || undefined,
        sourcePath,
        utmSource: tracking?.utmSource,
        utmMedium: tracking?.utmMedium,
        utmCampaign: tracking?.utmCampaign,
      };

      if (!hostedInquiriesEnabled) { setEmailDraft(payload); return; }
      const result = await submitWebsiteInquiry(payload);

      if (!result.success) {
        if (result.fieldErrors) { setFieldErrors(result.fieldErrors); focusError(result.fieldErrors); }
        setSubmitError(result.error || "We could not submit your brief. Please verify your details.");
          return;
      }

      setInquiryId(result.inquiryId || "");
      setIsSuccess(true);
    } catch {
      setSubmitError("Network connection interrupted. Please try again or email us directly at echo11.labs@gmail.com.");
    } finally { setIsSubmitting(false); }
  };

  const reviewRequired = form.projectType === "web-app" || form.projectType === "other";
  const error = (key: keyof FieldErrors) => fieldErrors[key] ? <p id={`error-${key}`} className="mt-2 text-sm text-red-300">{fieldErrors[key]}</p> : null;
  const inputClass = "mt-2 min-h-12 w-full border border-white/20 bg-white/[0.025] px-4 py-3 text-base text-white placeholder:text-white/35 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
  const choicesClass = (active: boolean) => `min-h-12 border px-4 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${active ? "border-accent text-accent bg-accent/[0.04]" : "border-white/20 text-white/75 hover:border-white/50"}`;

  if (emailDraft) return <InquiryEmailDraft inquiry={emailDraft} onEdit={() => setEmailDraft(null)} />;
  if (isSuccess) return (
    <div ref={receiptRef} tabIndex={-1} className="border-t border-accent py-10 outline-none" aria-labelledby="receipt-heading">
      <p className={LABEL}>Brief received {inquiryId && ` / ${inquiryId.slice(0, 8).toUpperCase()}`}</p>
      <h2 id="receipt-heading" className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">Thanks, {form.name}. We have your starting point.</h2>
      <p className="mt-5 text-base leading-7 text-white/70">We’ll review your brief for {form.company} and follow up at {form.email} with questions or a suggested next step. Scope, fees and a start date are agreed before work begins.</p>
      <dl className="mt-8 grid gap-6 border-y border-white/15 py-6 sm:grid-cols-2">
        <div><dt className={LABEL}>Project</dt><dd className="mt-2">{PROJECT_TYPE_LABELS[form.projectType]}</dd></div>
        <div><dt className={LABEL}>Preferred timing</dt><dd className="mt-2">{TIMELINE_LABELS[form.timeline as InquiryTimeline]}</dd></div>
      </dl>
      <p className="mt-6 text-sm leading-6 text-white/65">Have a deck or supporting files? Email <a className="text-accent underline underline-offset-4" href="mailto:echo11.labs@gmail.com">echo11.labs@gmail.com</a> and mention your company.</p>
    </div>
  );

  return (
    <form ref={formRef} id="inquiry-form" onSubmit={handleSubmit} noValidate aria-busy={isSubmitting} className="min-w-0">
      <div className="border-b border-white/15 pb-8">
        <h2 className="text-[clamp(1.75rem,3vw,2.6rem)] font-semibold leading-[1.12] tracking-[-0.04em]">{heading}</h2>
        <p className="mt-4 text-base leading-7 text-white/65">{description} Fields marked * are required.</p>
        {!hostedInquiriesEnabled && <p className="mt-3 text-sm leading-6 text-white/70">Prepare your brief here, then review and send it from your email app. Nothing is sent automatically.</p>}
        {form.referenceProject && <p className="mt-4 border-l border-accent pl-3 text-sm text-white/75">Your selected reference: <span className="text-white">{form.referenceProject}</span></p>}
      </div>

      <fieldset className="min-w-0 py-8 sm:py-10">
        <legend className="float-left mb-6 w-full text-xl font-semibold"><span className={`${LABEL} mr-4`}>01</span>Your project</legend>
        <div className="clear-both">
          <label htmlFor="inquiry-goals" className="text-sm text-white/85">What would you like to build or change? *</label>
          <p id="goals-hint" className="mt-2 text-sm leading-6 text-white/55">Tell us what you do, who it’s for, and what a better website should make possible.</p>
          <textarea id="inquiry-goals" data-field="goals" name="goals" required minLength={20} maxLength={5000} rows={4} value={form.goals} onChange={e => setValue("goals", e.target.value)} placeholder="We’re planning…" aria-invalid={!!fieldErrors.goals} aria-describedby={`goals-hint${fieldErrors.goals ? " error-goals" : ""}`} className={`${inputClass} resize-y leading-7`} />
          {error("goals")}
          <div role="group" aria-labelledby="project-type-label" className="mt-6">
            <p id="project-type-label" className="mb-3 text-sm text-white/85">What best describes the project? *</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PROJECT_TYPES.map(type => <button key={type} type="button" data-field="projectType" aria-pressed={form.projectType === type} onClick={() => setValue("projectType", type)} className={choicesClass(form.projectType === type)}>{PROJECT_TYPE_LABELS[type]}</button>)}
            </div>
            {error("projectType")}
          </div>
        </div>
      </fieldset>

      <fieldset className="min-w-0 border-t border-white/15 py-8 sm:py-10">
        <legend className="float-left mb-6 w-full text-xl font-semibold"><span className={`${LABEL} mr-4`}>02</span>Scope & timing</legend>
        <div className="clear-both">
          <div role="group" aria-labelledby="approach-label">
            <p id="approach-label" className="text-sm text-white/85">Your preferred starting approach *</p>
            <p className="mt-2 text-sm leading-6 text-white/55">A preference, not a commitment. We’ll confirm what fits your requirements.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["foundation", "custom"] as const).map(path => <button key={path} data-field="offerPath" type="button" aria-pressed={form.offerPath === path} onClick={() => setValue("offerPath", path)} className={choicesClass(form.offerPath === path)}>
                <span className="block text-base font-semibold">{OFFERS[path].shortLabel}</span>
                <span className="mt-2 block text-sm leading-6 text-white/60">{path === "foundation" ? "Adapt a proven public website system around your brand." : "Shape an original website around specific requirements."}</span>
                <span className="mt-4 block font-mono text-[11px] leading-5 text-white/75">{reviewRequired ? "Scope and estimate after review" : `From ${formatOfferPrice(path, currency)} ${currency} · ${OFFERS[path].timeline}`}</span>
              </button>)}
            </div>
            {error("offerPath")}
            <p className="mt-3 text-xs leading-5 text-white/55">{reviewRequired ? "Applications and unconfirmed requirements need a separate scope review; website prices and timelines do not apply." : "Indicative website estimates, not fixed quotes. Checkout and store operations need Custom scope."}</p>
          </div>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-3"><p className={LABEL}>Budget currency</p><CurrencySwitcher value={currency} onChange={changeCurrency} /></div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <p id="budget-label" className="mb-2 text-sm text-white/85">Budget range *</p>
              <Select value={form.budgetRange} onValueChange={value => setValue("budgetRange", value as BudgetRange)}>
                <SelectTrigger data-field="budgetRange" aria-labelledby="budget-label" aria-invalid={!!fieldErrors.budgetRange} aria-describedby={fieldErrors.budgetRange ? "error-budgetRange" : undefined} className="text-base"><SelectValue placeholder="Choose a range">{budgetOptions.find(option => option.value === form.budgetRange)?.label}</SelectValue></SelectTrigger>
                <SelectContent>{budgetOptions.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
              </Select>
              {error("budgetRange")}
            </div>
            <div>
              <p id="timing-label" className="mb-2 text-sm text-white/85">Preferred launch *</p>
              <Select value={form.timeline} onValueChange={value => setValue("timeline", value as InquiryTimeline)}>
                <SelectTrigger data-field="timeline" aria-labelledby="timing-label" aria-invalid={!!fieldErrors.timeline} aria-describedby={fieldErrors.timeline ? "error-timeline" : undefined} className="text-base"><SelectValue placeholder="Choose timing">{form.timeline ? TIMELINE_LABELS[form.timeline] : undefined}</SelectValue></SelectTrigger>
                <SelectContent>{TIMELINE_OPTIONS.map(option => <SelectItem key={option} value={option}>{TIMELINE_LABELS[option]}</SelectItem>)}</SelectContent>
              </Select>
              {error("timeline")}
            </div>
          </div>
          <p role="status" className="mt-3 text-sm text-white/65">{budgetNotice}</p>
        </div>
      </fieldset>

      <fieldset className="min-w-0 border-t border-white/15 py-8 sm:py-10">
        <legend className="float-left mb-6 w-full text-xl font-semibold"><span className={`${LABEL} mr-4`}>03</span>Your details</legend>
        <div className="clear-both grid gap-6 sm:grid-cols-2">
          {([
            { key: "name", label: "Your name *", type: "text", autocomplete: "name", placeholder: "Full name" },
            { key: "email", label: "Email address *", type: "email", autocomplete: "email", placeholder: "you@company.com" },
            { key: "company", label: "Company or project name *", type: "text", autocomplete: "organization", placeholder: "Your business or idea" },
            { key: "currentWebsite", label: "Current website (optional)", type: "text", autocomplete: "url", placeholder: "example.com" },
          ] as const).map(field => <div key={field.key}>
            <label htmlFor={`inquiry-${field.key}`} className="text-sm text-white/85">{field.label}</label>
            <input id={`inquiry-${field.key}`} data-field={field.key} name={field.key} type={field.type} autoComplete={field.autocomplete} required={field.key !== "currentWebsite"} maxLength={field.key === "email" ? 320 : field.key === "currentWebsite" ? 500 : 160} value={form[field.key]} onChange={e => setValue(field.key, e.target.value)} placeholder={field.placeholder} aria-invalid={!!fieldErrors[field.key]} aria-describedby={fieldErrors[field.key] ? `error-${field.key}` : undefined} className={inputClass} />
            {error(field.key)}
          </div>)}
        </div>
      </fieldset>
      <div className="hidden" aria-hidden="true"><label htmlFor="website-inquiry-trap">Leave this blank</label><input id="website-inquiry-trap" tabIndex={-1} autoComplete="off" value={form.website} onChange={e => setValue("website", e.target.value)} /></div>
      {submitError && <p role="alert" className="mb-6 border-l border-red-400 pl-4 text-sm leading-6 text-red-300">{submitError}</p>}
      <div className="flex flex-col gap-5 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-[32ch] text-xs leading-5 text-white/55">We use these details to respond to your inquiry. <Link href="/privacy" className="underline underline-offset-4 hover:text-white">Privacy policy</Link></p>
        <button type="submit" disabled={isSubmitting} className="group inline-flex min-h-14 shrink-0 items-center justify-center gap-4 bg-accent px-6 font-mono text-xs uppercase tracking-[0.1em] text-black transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-black disabled:opacity-60">{isSubmitting ? <><LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin motion-reduce:animate-none" />Sending…</> : <>{hostedInquiriesEnabled ? "Send project brief" : "Prepare email brief"}<ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" /></>}</button>
      </div>
      <p className="mt-4 text-sm leading-6 text-white/55">Sharing a brief starts a conversation. It does not book or commit you to a project.</p>
    </form>
  );
}
