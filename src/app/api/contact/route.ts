const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 5;

const ipWindow = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) {
    return "unknown";
  }

  return forwarded.split(",")[0]?.trim() || "unknown";
}

function withinRateLimit(ip: string) {
  const now = Date.now();
  const current = ipWindow.get(ip);

  if (!current || current.resetAt < now) {
    ipWindow.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (current.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  current.count += 1;
  ipWindow.set(ip, current);
  return true;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  if (!origin || !host) {
    return false;
  }

  return origin.includes(host);
}

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) {
      return Response.json({ ok: false, error: "invalid_origin" }, { status: 403 });
    }

    const ip = getClientIp(request);
    if (!withinRateLimit(ip)) {
      return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }

    const payload = (await request.json()) as {
      name?: string;
      email?: string;
      company?: string;
      message?: string;
      website?: string;
      submittedAt?: number;
    };

    const name = payload.name?.trim() ?? "";
    const email = payload.email?.trim() ?? "";
    const company = payload.company?.trim() ?? "";
    const message = payload.message?.trim() ?? "";
    const website = payload.website?.trim() ?? "";
    const submittedAt = Number(payload.submittedAt ?? 0);

    if (website.length > 0) {
      return Response.json({ ok: true }, { status: 200 });
    }

    if (!submittedAt || Date.now() - submittedAt < 1200) {
      return Response.json({ ok: false, error: "suspicious_submission" }, { status: 400 });
    }

    if (name.length < 2 || message.length < 12 || !isValidEmail(email)) {
      return Response.json({ ok: false, error: "invalid_payload" }, { status: 400 });
    }

    // Replace this with provider integration (email/CRM/webhook) in production.
    console.info("[contact]", {
      name,
      company,
      messageLength: message.length,
      emailDomain: email.split("@")[1] ?? "unknown",
    });

    return Response.json({ ok: true }, { status: 200 });
  } catch {
    return Response.json({ ok: false, error: "request_failed" }, { status: 500 });
  }
}
