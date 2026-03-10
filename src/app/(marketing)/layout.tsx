import type { ReactNode } from "react";
import { PageTransitionShell } from "@/components/animations/page-transition-shell";
import { DeferredAmbientBackground } from "@/components/sections/deferred-ambient-background";
import { SiteHeader } from "@/components/ui/navbar";
import { SiteFooter } from "@/components/ui/site-footer";
import { ToastRegion } from "@/components/ui/toast-region";
import { MARKETING_NAV } from "@/lib/content";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell">
      <DeferredAmbientBackground />
      <SiteHeader links={MARKETING_NAV} ctaHref="/contact" ctaLabel="Book Strategy Call" />
      <PageTransitionShell>
        <main>{children}</main>
      </PageTransitionShell>
      <SiteFooter links={MARKETING_NAV} />
      <ToastRegion />
    </div>
  );
}
