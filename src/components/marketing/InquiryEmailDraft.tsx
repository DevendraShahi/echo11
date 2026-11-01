"use client";

import { useEffect, useRef, useState } from "react";
import { getBudgetOptions, PROJECT_TYPE_LABELS, TIMELINE_LABELS, type WebsiteInquiryInput } from "@/lib/website-offers";

// Opt in only after the deployed database and notification delivery are verified.
export const hostedInquiriesEnabled = process.env.NEXT_PUBLIC_WEBSITE_INQUIRY_MODE === "hosted";

export function InquiryEmailDraft({ inquiry, onEdit }: { inquiry: WebsiteInquiryInput; onEdit: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [copyStatus, setCopyStatus] = useState("");
  useEffect(() => { heading.current?.focus(); }, []);
  const budget = getBudgetOptions(inquiry.offerPath, inquiry.currency).find(option => option.value === inquiry.budgetRange)?.label ?? "Budget to agree after scope review";
  const subject = `Website inquiry — ${inquiry.company}`;
  const body = [
    `Name: ${inquiry.name}`, `Email: ${inquiry.email}`, `Company / project: ${inquiry.company}`,
    `Project type: ${PROJECT_TYPE_LABELS[inquiry.projectType]}`,
    `Approach: ${inquiry.offerPath === "foundation" ? "Foundation" : "Custom"}`,
    `Budget: ${budget} (${inquiry.currency})`, `Timing: ${TIMELINE_LABELS[inquiry.timeline]}`,
    inquiry.currentWebsite ? `Current website: ${inquiry.currentWebsite}` : "",
    inquiry.referenceProject ? `Reference / fit: ${inquiry.referenceProject}` : "",
    "", "Project brief:", inquiry.goals,
  ].filter(line => line !== "").join("\n");
  const emailLink = `mailto:echo11.labs@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  async function copyBrief() {
    try { await navigator.clipboard.writeText(`${subject}\n\n${body}`); setCopyStatus("Brief copied. Paste it into an email to echo11.labs@gmail.com."); }
    catch { setCopyStatus("Select and copy the brief below, then email it to echo11.labs@gmail.com."); }
  }
  const linkClass = "inline-flex min-h-12 items-center justify-center border border-white/30 px-5 text-sm transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent";
  return <div className="border-t border-accent py-8">
    <p className="font-mono text-xs uppercase tracking-widest text-accent">Ready to email</p>
    <h3 ref={heading} tabIndex={-1} className="mt-4 text-3xl font-semibold tracking-tight outline-none">Your brief is ready. Send it when you’re ready.</h3>
    <p className="mt-4 max-w-xl text-base leading-7 text-white/75">Nothing has been sent or saved to our inbox yet. Open your email app to review and send the brief to <a href="mailto:echo11.labs@gmail.com" className="underline underline-offset-4">echo11.labs@gmail.com</a>, or copy it into your preferred email service.</p>
    <div className="mt-6 flex flex-wrap gap-3">
      <a href={emailLink} className={`${linkClass} bg-accent !text-black`}>Open email app</a>
      <button type="button" onClick={copyBrief} className={linkClass}>Copy brief</button>
      <button type="button" onClick={onEdit} className={linkClass}>Edit brief</button>
    </div>
    <p role="status" className="mt-3 text-sm text-white/70">{copyStatus}</p>
    <details className="mt-5 border-t border-white/20 pt-4">
      <summary className="cursor-pointer py-2 text-sm text-white/80">Review your email brief</summary>
      <pre className="mt-3 whitespace-pre-wrap break-words font-sans text-sm leading-7 text-white/70">{body}</pre>
    </details>
  </div>;
}
