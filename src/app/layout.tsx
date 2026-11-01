import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SplashScreen } from "@/components/layout/SplashScreen";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
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
  /**
   * Neither element carries `overflow-x-hidden` on purpose. The base layer
   * already sets `overflow-x: clip` on both, and the utility would win over it
   * and turn the body into a scroll container that never scrolls, which stands
   * every `position: sticky` on the site down. Measured on Home: a `sticky
   * top-16` element tracked the scroll instead of pinning, and held at its 64px
   * offset once the utility was dropped.
   */
  return (
    <html lang="en" className="dark">
      <body className={`${syne.variable} ${spaceMono.variable} antialiased selection:bg-accent selection:text-black w-full min-h-screen relative`}>
        {/* reducedMotion="user": framer-motion skips transform/layout animations
            when the OS requests reduced motion; opacity/color still animate.
            CSS keyframes (marquee) are guarded in globals.css. */}
        <MotionConfig reducedMotion="user">
          <SmoothScroll>
            <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
            <SplashScreen />
            <Cursor />
            <Navbar />
            {children}
            <Footer />
          </SmoothScroll>
        </MotionConfig>
      </body>
    </html>
  );
}
