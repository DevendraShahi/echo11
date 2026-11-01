import "server-only";

import { cookies, headers } from "next/headers";
import {
  CurrencyCode,
  currencyForCountry,
  isCurrencyCode,
} from "@/lib/website-offers";

export const CURRENCY_COOKIE = "echo11_currency";

export async function getRequestCountryCode(): Promise<string | null> {
  const headerStore = await headers();
  return (
    headerStore.get("x-vercel-ip-country") ||
    headerStore.get("cf-ipcountry") ||
    null
  );
}

export async function getVisitorCurrency(): Promise<CurrencyCode> {
  const cookieStore = await cookies();
  const savedCurrency = cookieStore.get(CURRENCY_COOKIE)?.value;

  if (isCurrencyCode(savedCurrency)) return savedCurrency;

  return currencyForCountry(await getRequestCountryCode());
}
