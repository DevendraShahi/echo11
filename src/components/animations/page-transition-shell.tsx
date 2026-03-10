"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

type PageTransitionShellProps = {
  children: ReactNode;
};

export function PageTransitionShell({ children }: PageTransitionShellProps) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  return (
    <div
      key={pathname}
      className={reducedMotion ? "page-transition page-transition-reduced" : "page-transition"}
    >
      {children}
    </div>
  );
}
