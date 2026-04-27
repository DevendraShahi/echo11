import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Cursor } from "@/components/ui/Cursor";

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
  title: "echo11 | Product Engineering Studio",
  description: "We design and engineer high-performance digital products with sharp brand execution and reliable systems.",
  robots: "index, follow",
  icons: {
    icon: "/echo11-logo-white.svg",
    apple: "/echo11-logo-white.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://echo11.dev",
    title: "echo11 | Product Engineering Studio",
    description: "From concept to scale, echo11 builds digital products that perform, convert, and last.",
    siteName: "echo11",
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
        <Cursor />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
