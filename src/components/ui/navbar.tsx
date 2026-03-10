"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { CommandPalette } from "@/components/ui/command-palette";
import { ModalDialog } from "@/components/ui/modal-dialog";
import { trackEvent } from "@/lib/analytics";
import type { NavLink } from "@/lib/content";

type SiteHeaderProps = {
  links: NavLink[];
  ctaHref: string;
  ctaLabel: string;
};

export function SiteHeader({ links, ctaHref, ctaLabel }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const mobileLinks = useMemo(() => links.filter((link) => link.href !== "/"), [links]);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <header className="site-header">
      <div className="container-shell header-inner">
        <Link className="brand-mark" href="/" aria-label="echo11 home">
          <Image
            src="/brand/echo11-logo-white.svg"
            alt="echo11"
            width={118}
            height={34}
            priority
          />
        </Link>

        <nav aria-label="Primary" className="header-nav">
          {links.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="header-actions">
          <div className="header-command desktop-only">
            <CommandPalette links={links} />
          </div>

          <Link
            className="btn-primary"
            href={ctaHref}
            onClick={() => trackEvent("cta_click", { cta_id: "header_primary", position: "header" })}
          >
            {ctaLabel}
            <span className="btn-scan" aria-hidden="true"></span>
          </Link>

          <button
            className="header-action mobile-only"
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      <ModalDialog title="Primary navigation" open={mobileOpen} onClose={() => setMobileOpen(false)}>
        <nav id="mobile-nav-panel" className="mobile-nav" aria-label="Mobile primary navigation">
          {mobileLinks.map((link) => {
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </ModalDialog>
    </header>
  );
}
