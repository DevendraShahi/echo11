"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ProjectItem } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";

type WorkGridProps = {
  projects: ProjectItem[];
};

const FILTER_ALL = "All";

export function WorkGrid({ projects }: WorkGridProps) {
  const industries = useMemo(() => {
    const unique = Array.from(new Set(projects.map((project) => project.industry)));
    return [FILTER_ALL, ...unique];
  }, [projects]);

  const [activeFilter, setActiveFilter] = useState(FILTER_ALL);

  const visible = useMemo(() => {
    if (activeFilter === FILTER_ALL) {
      return projects;
    }
    return projects.filter((project) => project.industry === activeFilter);
  }, [activeFilter, projects]);

  const onFilterChange = (filter: string) => {
    setActiveFilter(filter);
    trackEvent("work_filter_change", {
      filter_type: "industry",
      value: filter,
    });
  };

  return (
    <>
      <div className="filter-row" role="list" aria-label="Work filters">
        {industries.map((filter) => (
          <button
            key={filter}
            type="button"
            className={activeFilter === filter ? "is-active" : ""}
            onClick={() => onFilterChange(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="project-grid">
        {visible.map((project) => (
          <article className="project-card" key={project.slug}>
            <p className="project-preview-industry">{project.industry}</p>
            <h2>{project.name}</h2>
            <p>{project.overview}</p>

            <ul>
              {project.stack.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>

            <p className="project-preview-result">{project.result}</p>
            <Link href={`/work/${project.slug}`}>Open case study</Link>
          </article>
        ))}
      </div>
    </>
  );
}
