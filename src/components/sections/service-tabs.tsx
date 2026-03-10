"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SERVICE_PANELS } from "@/lib/content";

export function ServiceTabs() {
  const [activeSlug, setActiveSlug] = useState(SERVICE_PANELS[0]?.slug ?? "");

  const activePanel = useMemo(
    () => SERVICE_PANELS.find((panel) => panel.slug === activeSlug) ?? SERVICE_PANELS[0],
    [activeSlug],
  );

  if (!activePanel) {
    return null;
  }

  return (
    <div className="service-tabs-shell">
      <div className="service-tabs" role="tablist" aria-label="Service categories">
        {SERVICE_PANELS.map((panel) => {
          const active = panel.slug === activePanel.slug;

          return (
            <button
              key={panel.slug}
              type="button"
              role="tab"
              aria-selected={active}
              className={`service-tab ${active ? "service-tab-active" : ""}`.trim()}
              onClick={() => setActiveSlug(panel.slug)}
            >
              {panel.title}
            </button>
          );
        })}
      </div>

      <article className="service-tab-panel" role="tabpanel" aria-live="polite">
        <p className="service-panel-tag">{activePanel.title}</p>
        <p className="service-panel-summary">{activePanel.summary}</p>
        <p className="service-panel-outcome">{activePanel.outcomes}</p>
        <ul className="service-panel-list">
          {activePanel.process.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>

        <Link href={`/services/${activePanel.slug}`} className="service-panel-link">
          View full delivery scope
        </Link>
      </article>
    </div>
  );
}
