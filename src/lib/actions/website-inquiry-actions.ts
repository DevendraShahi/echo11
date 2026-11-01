"use server";

import { createClient as createServiceClient } from "@supabase/supabase-js";
import { sendWebsiteInquiryEmail } from "@/lib/email";
import { getRequestCountryCode } from "@/lib/website-region";
import {
  BUDGET_RANGES,
  CURRENCY_CODES,
  InquiryResult,
  OFFER_PATHS,
  PROJECT_TYPES,
  TIMELINE_OPTIONS,
  WebsiteInquiryInput,
} from "@/lib/website-offers";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DUPLICATE_WINDOW_MS = 2 * 60 * 1000;

function clean(value: string | undefined, maxLength: number): string {
  return (value || "").trim().slice(0, maxLength);
}

function normalizeWebsite(value: string | undefined): string | null {
  const candidate = clean(value, 500);
  if (!candidate) return null;

  try {
    const normalized = /^https?:\/\//i.test(candidate) ? candidate : `https://${candidate}`;
    return new URL(normalized).toString().slice(0, 500);
  } catch {
    return null;
  }
}

function validateInquiry(input: WebsiteInquiryInput): InquiryResult["fieldErrors"] {
  const errors: NonNullable<InquiryResult["fieldErrors"]> = {};
  const name = clean(input.name, 120);
  const email = clean(input.email, 320).toLowerCase();
  const company = clean(input.company, 160);
  const goals = clean(input.goals, 5000);

  if (!OFFER_PATHS.includes(input.offerPath)) errors.offerPath = "Choose a project route.";
  if (!PROJECT_TYPES.includes(input.projectType)) errors.projectType = "Choose a project type.";
  if (name.length < 2) errors.name = "Enter your name.";
  if (!EMAIL_PATTERN.test(email)) errors.email = "Enter a valid work email.";
  if (company.length < 2) errors.company = "Enter your company or organization.";
  if (input.currentWebsite && !normalizeWebsite(input.currentWebsite)) {
    errors.currentWebsite = "Enter a valid website address.";
  }
  if (!BUDGET_RANGES.includes(input.budgetRange)) errors.budgetRange = "Choose a budget range.";
  if (!TIMELINE_OPTIONS.includes(input.timeline)) errors.timeline = "Choose a target timeline.";
  if (goals.length < 20) errors.goals = "Tell us a little more about the outcome you need.";
  if (!CURRENCY_CODES.includes(input.currency)) errors.currency = "Choose a supported currency.";

  return Object.keys(errors).length ? errors : undefined;
}

export async function submitWebsiteInquiry(
  input: WebsiteInquiryInput
): Promise<InquiryResult> {
  if (clean(input.website, 200)) {
    return { success: true };
  }

  const fieldErrors = validateInquiry(input);
  if (fieldErrors) {
    return { success: false, error: "Review the highlighted fields.", fieldErrors };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Website inquiry service is missing Supabase configuration");
    return {
      success: false,
      error: "The inquiry service is temporarily unavailable. Email echo11.labs@gmail.com instead.",
    };
  }

  const service = createServiceClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const email = clean(input.email, 320).toLowerCase();
  const duplicateSince = new Date(Date.now() - DUPLICATE_WINDOW_MS).toISOString();

  try {
    const { data: duplicate } = await service
      .from("website_inquiries")
      .select("id")
      .eq("email", email)
      .gte("created_at", duplicateSince)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (duplicate?.id) {
      return { success: true, inquiryId: duplicate.id };
    }

    const countryCode = (await getRequestCountryCode())?.toUpperCase().slice(0, 2) || null;
    const record = {
      offer_path: input.offerPath,
      project_type: input.projectType,
      name: clean(input.name, 120),
      email,
      company: clean(input.company, 160),
      current_website: normalizeWebsite(input.currentWebsite),
      budget_range: input.budgetRange,
      timeline: input.timeline,
      goals: clean(input.goals, 5000),
      reference_project: clean(input.referenceProject, 80) || null,
      source_path: clean(input.sourcePath, 500) || "/contact",
      country_code: countryCode,
      currency: input.currency,
      utm_source: clean(input.utmSource, 160) || null,
      utm_medium: clean(input.utmMedium, 160) || null,
      utm_campaign: clean(input.utmCampaign, 160) || null,
    };

    const { data: inquiry, error: insertError } = await service
      .from("website_inquiries")
      .insert(record)
      .select("id")
      .single();

    if (insertError || !inquiry) {
      console.error("Failed to save website inquiry:", insertError);
      return {
        success: false,
        error: "We couldn't save your inquiry. Try again or email echo11.labs@gmail.com.",
      };
    }

    const emailResult = await sendWebsiteInquiryEmail({
      inquiryId: inquiry.id,
      ...record,
    });

    const notificationUpdate = emailResult.success
      ? {
          notification_sent: true,
          notified_at: new Date().toISOString(),
          notification_error: null,
        }
      : {
          notification_sent: false,
          notified_at: null,
          notification_error: clean(emailResult.error, 500) || "Notification was not sent",
        };

    const { error: updateError } = await service
      .from("website_inquiries")
      .update(notificationUpdate)
      .eq("id", inquiry.id);

    if (updateError) {
      console.error("Failed to update inquiry notification state:", updateError);
    }

    return { success: true, inquiryId: inquiry.id };
  } catch (error) {
    console.error("Unexpected website inquiry error:", error);
    return {
      success: false,
      error: "We couldn't send your inquiry. Try again or email echo11.labs@gmail.com.",
    };
  }
}
