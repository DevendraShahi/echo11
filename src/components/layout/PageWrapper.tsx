"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const horizonOpacity = useTransform(scrollY, [0, 560], [0.35, 0.1]);

  return (
    <motion.div
      key={pathname}
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut" }}
      className="studio-page relative z-0 flex min-h-screen flex-col overflow-x-clip"
    >
      {/* Page-wide film grain — DISABLED (2026-10-03). Restore by uncommenting;
          recipe lives in .grain-overlay (src/app/globals.css) and must stay in
          its original `overlay / 0.04` form. Context:
          docs/grain-overlay-restore-plan.md */}
      {/* <div className="grain-overlay fixed inset-0 z-50 pointer-events-none" /> */}

      {/* The original circular glow has its own space above the content. */}
      {pathname !== "/" && <>
        <motion.div aria-hidden="true" style={{ opacity: reduce ? 0.35 : horizonOpacity }} className="studio-sky pointer-events-none absolute inset-x-0 z-0 flex justify-center overflow-hidden">
          <motion.div
            key={pathname}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: reduce ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
            className="studio-horizon absolute top-0 rounded-full"
          />
        </motion.div>
      </>}

      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </motion.div>
  );
}
