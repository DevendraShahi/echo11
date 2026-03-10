"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ModalDialog } from "@/components/ui/modal-dialog";
import type { NavLink } from "@/lib/content";

type CommandPaletteProps = {
  links: NavLink[];
};

export function CommandPalette({ links }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const lower = query.toLowerCase();
    return links.filter((link) => link.label.toLowerCase().includes(lower));
  }, [links, query]);

  return (
    <>
      <button className="header-action" type="button" onClick={() => setOpen(true)}>
        Search
      </button>

      <ModalDialog title="Command palette" open={open} onClose={() => setOpen(false)}>
        <div className="command-shell">
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Jump to route"
            aria-label="Jump to route"
          />
          <ul>
            {filtered.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </ModalDialog>
    </>
  );
}
