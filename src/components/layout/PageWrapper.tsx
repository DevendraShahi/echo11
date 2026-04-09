"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function PageWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex min-h-screen flex-col relative z-0"
    >
      <div className="grain-overlay fixed inset-0 z-50 pointer-events-none" />

      {/* Cinematic top-locked semi-radius gradient (Figma reference) applied ONLY to inner pages */}
      {pathname !== "/" && (
        <div className="absolute top-0 left-0 w-full h-[800px] pointer-events-none z-0 flex justify-center">
          {/* Pure, dense cyan-blue radial orb mimicking the Figma design perfectly */}
          <div className="orb-pulse w-[1200px] h-[1200px] absolute top-[-600px] opacity-80 blur-[80px] rounded-full" />
        </div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </motion.div>
  );
}
