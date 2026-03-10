import type { ReactNode } from "react";
import Link from "next/link";
import { PageTransitionShell } from "@/components/animations/page-transition-shell";
import { LEGAL_NAV } from "@/lib/content";

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="page-shell legal-shell">
      <header className="site-header legal-header">
        <div className="container-shell legal-header-inner">
          <Link href="/" className="brand-mark">
            Echo11
          </Link>
          <nav className="header-nav" aria-label="Legal">
            {LEGAL_NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <PageTransitionShell>
        <main>{children}</main>
      </PageTransitionShell>
    </div>
  );
}
