"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { navigation, primaryNavigation } from "@/data/navigation";

const navItems = primaryNavigation;

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="echo-nav__arrow"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
      />
    </svg>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isNavigatingRef = useRef(false);
  const prevPathnameRef = useRef(pathname);

  // Lock the page while the mobile sheet is open. Body overflow alone is
  // unreliable (iOS + overflow-x:clip on html); freeze scroll position too.
  useEffect(() => {
    if (!menuOpen) return;

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;

      if (isNavigatingRef.current) {
        isNavigatingRef.current = false;
        window.scrollTo(0, 0);
        const lenis = (window as Window & { __lenis?: { scrollTo: (target: number, opts?: unknown) => void } }).__lenis;
        if (lenis) {
          lenis.scrollTo(0, { immediate: true, force: true });
        }
      } else {
        window.scrollTo(0, scrollY);
      }
    };
  }, [menuOpen]);

  // Mobile menu: Escape closes and restores focus to the toggle;
  // opening moves focus to the first item. The panel is non-modal
  // (an inline expanding region), so focus is not trapped.
  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const firstFocusable = menuRef.current?.querySelector<HTMLElement>("a, button");
    firstFocusable?.focus();

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  // Close the mobile panel when the route changes (Link click or back).
  useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      isNavigatingRef.current = true;
      prevPathnameRef.current = pathname;
    }
    setMenuOpen(false);
  }, [pathname]);

  const handleNavClick = () => {
    isNavigatingRef.current = true;
    setMenuOpen(false);
  };

  if (
    pathname.startsWith("/lab") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/client") ||
    pathname.startsWith("/laltin") ||
    pathname.startsWith("/pizzaslice")
  ) {
    return null;
  }

  return (
    <header
      className={`echo-nav fixed inset-x-0 top-0 z-50 w-full ${
        menuOpen ? "echo-nav--open" : ""
      } ${scrolled ? "echo-nav--scrolled" : ""}`}
    >
      <nav aria-label="Primary" className="echo-nav__bar">
        <div className="echo-nav__content">
          <Link
            href="/"
            className="echo-nav__brand"
            aria-label="echo11 home"
            onClick={handleNavClick}
          >
            <Image
              src="/echo11-logo-white.svg"
              alt=""
              width={96}
              height={32}
              className="echo-nav__logo"
              priority
            />
          </Link>

          <div className="echo-nav__control">
            <button
              ref={toggleRef}
              type="button"
              className="echo-nav__toggle"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="primary-options"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </button>
          </div>

          <div ref={menuRef} id="primary-options" className="echo-nav__options">
            {navItems.map((item, index) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`echo-nav__link${active ? " is-active" : ""}`}
                  aria-current={active ? "page" : undefined}
                  style={{ "--echo-nav-i": index } as React.CSSProperties}
                  onClick={handleNavClick}
                >
                  <span className="echo-nav__index" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="echo-nav__label">{item.name}</span>
                  <ArrowIcon />
                </Link>
              );
            })}

            <div
              className="echo-nav__meta"
              style={{ "--echo-nav-i": navItems.length } as React.CSSProperties}
            >
              <Link
                href={navigation.contact.href}
                className="echo-nav__link echo-nav__link--cta"
                onClick={handleNavClick}
              >
                <span className="echo-nav__label">{navigation.contact.name}</span>
                <ArrowIcon />
              </Link>
              <a
                href="mailto:echo11.labs@gmail.com"
                className="echo-nav__email"
                style={{ "--echo-nav-i": navItems.length + 1 } as React.CSSProperties}
                onClick={() => setMenuOpen(false)}
              >
                echo11.labs@gmail.com
              </a>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
