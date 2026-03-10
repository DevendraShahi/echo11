import type { Metadata } from "next";
import { Cormorant_Garamond, Geist_Mono, Manrope } from "next/font/google";
import { SITE_URL } from "@/lib/seo";
import "./globals.css";
import "./redesign-v3.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceMono = Geist_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-cormorant-garamond",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Echo11 | Premium Website Architecture",
    template: "%s",
  },
  description:
    "Echo11 designs, builds, and runs premium web platforms for growth-stage businesses and high-visibility brands.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Echo11 | Premium Website Architecture",
    description:
      "Echo11 designs, builds, and runs premium web platforms for growth-stage businesses and high-visibility brands.",
    url: SITE_URL,
    siteName: "Echo11",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Echo11 | Premium Website Architecture",
    description:
      "Echo11 designs, builds, and runs premium web platforms for growth-stage businesses and high-visibility brands.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${spaceMono.variable} ${cormorantGaramond.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
