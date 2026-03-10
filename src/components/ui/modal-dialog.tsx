"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

type ModalDialogProps = {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
};

export function ModalDialog({ title, open, onClose, children }: ModalDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open || !dialogRef.current) {
      return;
    }

    const dialog = dialogRef.current;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    first?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="header-action" type="button" onClick={onClose}>
            Close
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
