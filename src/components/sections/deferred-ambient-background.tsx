"use client";

import dynamic from "next/dynamic";

const ScrollAmbientBackground = dynamic(
  () => import("@/components/scroll-ambient-background").then((module) => module.ScrollAmbientBackground),
  {
    ssr: false,
  },
);

export function DeferredAmbientBackground() {
  return <ScrollAmbientBackground />;
}
