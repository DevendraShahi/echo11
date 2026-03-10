import Link from "next/link";
import { LEGAL_NAV } from "@/lib/content";
import type { NavLink } from "@/lib/content";

type SiteFooterProps = {
  links: NavLink[];
};

export function SiteFooter({ links }: SiteFooterProps) {
  return (
    <footer className="site-footer">
      <div className="container-shell footer-technical-grid">
        <div className="footer-brand chassis-panel">
          <span className="chassis-seam-tl" aria-hidden="true" />
          <p className="footer-brand-mark">Echo11 // Industrial Web Systems</p>
          <p>
            Premium web architecture for operators who need speed, credibility,
            and measurable outcomes.
          </p>
          <p className="footer-status">STATUS: ONLINE · OPERATIONS ACTIVE</p>
          <span className="chassis-corner-br" aria-hidden="true" />
        </div>

        <div className="footer-links" aria-label="Footer navigation">
          <h4>Navigation</h4>
          <nav>
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <h4>Legal</h4>
          <nav>
            {LEGAL_NAV.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="footer-meta">
          <h4>Connect</h4>
          <a href="mailto:hello@echo11.com">hello@echo11.com</a>
          <a href="https://www.linkedin.com" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href="https://x.com" target="_blank" rel="noreferrer">
            X / Twitter
          </a>
          <p>Kathmandu, Nepal</p>
          <div className="footer-status-line">
            <span>© {new Date().getFullYear()} Echo11</span>
            <span>Built on Next.js + GSAP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
