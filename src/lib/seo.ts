import type { Metadata } from "next";

export const siteConfig = {
  name: "echo11",
  url: "https://echo11.tech",
  title: "echo11 | Product Engineering Studio",
  description:
    "We design and engineer digital products with clear strategy, strong systems, and premium execution.",
  ogDescription:
    "From concept to scale, echo11 builds digital products that perform, convert, and last.",
  openGraphImage: "/opengraph-image",
  twitterImage: "/twitter-image",
  logo: "/echo11-logo.png",
  email: "echo11.labs@gmail.com",
} as const;

interface CreateMetadataOptions {
  title: string;
  description: string;
  ogDescription?: string;
  path?: string;
  image?: string;
  twitterImage?: string;
  type?: "website" | "article";
}

export function absoluteUrl(path = "/") {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  return new URL(path, siteConfig.url).toString();
}

export function createMetadata({
  title,
  description,
  ogDescription,
  path = "/",
  image = siteConfig.openGraphImage,
  twitterImage,
  type = "website",
}: CreateMetadataOptions): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const twitterImageUrl = absoluteUrl(
    twitterImage ?? (image === siteConfig.openGraphImage ? siteConfig.twitterImage : image)
  );
  const socialDescription = ogDescription ?? description;

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type,
      locale: "en_US",
      url,
      title,
      description: socialDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: socialDescription,
      images: [twitterImageUrl],
    },
  };
}

export const noIndexMetadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.logo),
    email: siteConfig.email,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; item: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}
