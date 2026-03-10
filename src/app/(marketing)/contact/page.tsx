import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { ContactForm } from "@/components/sections/contact-form";
import { CONTACT_CHANNELS } from "@/lib/content";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Contact | Echo11",
  description:
    "Start a project with Echo11. Share your timeline, constraints, and growth goals.",
  pathname: "/contact",
});

export default function ContactPage() {
  return (
    <div className="container-shell page-section contact-page">
      <JsonLd
        schema={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          name: "Echo11 Contact",
        }}
      />

      <header className="section-heading">
        <p className="section-marker">Contact</p>
        <h1>Tell us what you need to ship in the next 6-8 weeks.</h1>
        <p>
          We scope quickly, define clear operating boundaries, and build a
          delivery plan you can execute with confidence.
        </p>
      </header>

      <div className="contact-layout">
        <ContactForm />

        <aside className="contact-sidebar">
          <div className="contact-map" aria-hidden="true">
            <span>Kathmandu</span>
          </div>

          <ul>
            {CONTACT_CHANNELS.map((channel) => (
              <li key={channel.label}>
                <p>{channel.label}</p>
                {channel.href === "#" ? (
                  <span>{channel.value}</span>
                ) : channel.href.startsWith("mailto:") ? (
                  <a href={channel.href}>{channel.value}</a>
                ) : (
                  <Link href={channel.href}>{channel.value}</Link>
                )}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
