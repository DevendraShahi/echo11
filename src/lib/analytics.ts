export type AnalyticsEventName =
  | "cta_click"
  | "form_submit_attempt"
  | "form_submit_success"
  | "work_filter_change"
  | "pricing_toggle";

export type AnalyticsPayload = Record<string, string | number | boolean | null>;

function sanitizePath(pathname: string) {
  return pathname.split("?")[0];
}

function sanitizePayload(payload: AnalyticsPayload = {}) {
  const safePayload: AnalyticsPayload = {};

  for (const [key, value] of Object.entries(payload)) {
    if (key.toLowerCase().includes("email") || key.toLowerCase().includes("phone")) {
      continue;
    }
    safePayload[key] = value;
  }

  return safePayload;
}

export function trackEvent(name: AnalyticsEventName, payload: AnalyticsPayload = {}) {
  if (typeof window === "undefined") {
    return;
  }

  const event = {
    name,
    path: sanitizePath(window.location.pathname),
    timestamp: Date.now(),
    payload: sanitizePayload(payload),
  };

  window.dispatchEvent(new CustomEvent("echo11:analytics", { detail: event }));

  if (process.env.NODE_ENV !== "production") {
    // Keep local visibility without leaking PII in logs.
    console.info("[analytics]", event);
  }
}
