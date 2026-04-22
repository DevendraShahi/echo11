"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Work", href: "/work" },
  { name: "Services", href: "/services" },
  { name: "Process", href: "/process" },
  { name: "About", href: "/about" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname.startsWith('/lab') || pathname.startsWith('/portal')) {
    return null;
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 w-full overflow-x-clip transition-all duration-300 ${
        scrolled
          ? "glass !bg-black/40 border-b border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 w-full min-w-0 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80">
          <div className="relative w-24 h-8">
            <Image 
              src="/echo11-logo-white.svg" 
              alt="echo11 logo" 
              fill 
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden xl:flex min-w-0 flex-1 items-center justify-center gap-5 2xl:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-medium transition-colors font-mono ${
                pathname === item.href
                  ? pathname === "/" 
                    ? "text-accent text-glow" 
                    : "text-white text-glow-white"
                  : pathname === "/"
                    ? "text-muted-foreground hover:text-accent"
                    : "text-white/60 hover:text-white"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden xl:flex shrink-0 items-center gap-4">
          <Button 
            asChild 
            variant="outline" 
            className={`font-mono text-xs transition-all ${
              pathname !== "/" 
                ? "border-white/40 text-white hover:bg-white hover:text-black shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]" 
                : ""
            }`}
          >
            <Link href="/contact">Book Discovery</Link>
          </Button>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="xl:hidden ml-auto shrink-0 text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden overflow-hidden glass border-b border-white/10"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-lg font-medium transition-colors font-mono ${
                    pathname === item.href
                      ? pathname === "/"
                        ? "text-accent text-glow"
                        : "text-white text-glow-white"
                      : pathname === "/"
                        ? "text-muted-foreground hover:text-accent"
                        : "text-white/60 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <Button 
                asChild 
                variant={pathname === "/" ? "default" : "outline"} 
                className={`w-full mt-4 font-mono text-sm ${
                  pathname !== "/" 
                    ? "border-white/40 text-white hover:bg-white hover:text-black shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]" 
                    : ""
                }`}
              >
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>Book Discovery</Link>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
