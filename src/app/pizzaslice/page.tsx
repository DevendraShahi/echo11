import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Schibsted_Grotesk } from "next/font/google";
import { PizzaSliceExperience } from "./PizzaSliceExperience";
import "./pizzaslice.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--ps-font-display",
  display: "swap",
});

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--ps-font-sans",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--ps-font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "pizzaslice — Char on the edge. Room for one more.",
  description:
    "A neighborhood pizzeria concept: long-fermented dough, a very hot oven, and a table that never rushes you.",
  openGraph: {
    title: "pizzaslice — Char on the edge. Room for one more.",
    description:
      "Long-fermented dough, a very hot oven, and a table that never rushes you. A restaurant concept by Echo11.",
    type: "website",
  },
  other: {
    "theme-color": "#121110",
  },
};

export default function PizzaSlicePage() {
  return (
    <div className={`${newsreader.variable} ${schibsted.variable} ${plexMono.variable}`}>
      <PizzaSliceExperience />
    </div>
  );
}
