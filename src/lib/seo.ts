import type { Metadata } from "next";

export const SITE_URL = process.env.SITE_URL ?? "https://echo11.studio";

export function absoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

type MetadataInput = {
  title: string;
  description: string;
  pathname: string;
  noindex?: boolean;
};

export function createPageMetadata({
  title,
  description,
  pathname,
  noindex = false,
}: MetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: pathname,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(pathname),
      siteName: "Echo11",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: noindex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
        },
  };
}

export type JsonLdSchema = Record<string, unknown>;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Echo11",
    url: SITE_URL,
    email: "hello@echo11.com",
    sameAs: [
      "https://www.linkedin.com",
      "https://x.com",
      "https://github.com/DevendraShahi/echo11",
    ],
  } as const;
}
