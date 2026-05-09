import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Cursor } from "@/components/ui/Cursor";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  createMetadata,
  organizationJsonLd,
  siteConfig,
  websiteJsonLd,
} from "@/lib/seo";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});

const spaceMono = JetBrains_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-geist-mono", // Using user requested variable name
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  ...createMetadata({
    title: siteConfig.title,
    description: siteConfig.description,
    ogDescription: siteConfig.ogDescription,
    path: "/",
  }),
  title: {
    default: siteConfig.title,
    template: "%s",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/echo11-logo-white.svg",
    apple: "/echo11-logo-white.png",
  },
    verification: {
          google: "b2avGLMCH_nOM8Xv9C-cu7FEvmEsBpb_kw9vqVA68Lc",
        },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark overflow-x-hidden">
      <body className={`${syne.variable} ${spaceMono.variable} antialiased selection:bg-accent selection:text-black overflow-x-hidden w-full min-h-screen relative`}>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Cursor />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
