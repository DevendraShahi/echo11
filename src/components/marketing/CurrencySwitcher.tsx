"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { ChevronDown } from "lucide-react";
import { CURRENCY_CODES, CurrencyCode } from "@/lib/website-offers";
import { cn } from "@/lib/utils";

interface CurrencySwitcherProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  className?: string;
}

/**
 * Pricing currency, as a dropdown the design system owns rather than the
 * browser's. The native `<select>` popup cannot be styled, so it arrived as a
 * light system menu in the middle of a dark, sharp-edged page.
 *
 * The markup is the buttons-plus-listbox pattern: a trigger that reports
 * `aria-expanded` and controls a list of options, with the selected option
 * focused when the list opens, the arrow keys moving through it, and `Escape`
 * closing it back onto the trigger. The list is keyboard-driven rather than
 * hover-driven, so a passing pointer never moves the focus ring.
 */
export function CurrencySwitcher({ value, onChange, className = "" }: CurrencySwitcherProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => CURRENCY_CODES.indexOf(value));
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const labelId = useId();
  const valueId = useId();
  const listId = useId();

  /**
   * The selected option takes focus as the list opens, so the reader lands on
   * the current value and the arrow keys move from there.
   */
  useEffect(() => {
    if (!open) return;
    optionRefs.current[activeIndex]?.focus({ preventScroll: true });
  }, [open, activeIndex]);

  /**
   * Anything outside the control closes it. `pointerdown` rather than `click`,
   * so the list is already gone before a click lands somewhere else.
   */
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  const close = (returnFocus = false) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true });
  };

  const openAt = (index: number) => {
    setActiveIndex(index);
    setOpen(true);
  };

  const commit = (currency: CurrencyCode) => {
    document.cookie = `echo11_currency=${currency}; path=/; max-age=31536000; samesite=lax`;
    onChange(currency);
    close(true);
  };

  const handleTriggerKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      openAt(CURRENCY_CODES.length - 1);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openAt(CURRENCY_CODES.indexOf(value));
    }
  };

  const handleListKeyDown = (event: ReactKeyboardEvent<HTMLUListElement>) => {
    const last = CURRENCY_CODES.length - 1;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => (index === last ? 0 : index + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => (index === 0 ? last : index - 1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(CURRENCY_CODES[activeIndex]);
        break;
      case "Escape":
        event.preventDefault();
        close(true);
        break;
      case "Tab":
        close();
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={rootRef}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
      className={cn(
        "relative inline-flex items-center gap-3 font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground",
        className,
      )}
    >
      <span id={labelId}>Currency</span>

      <button
        ref={triggerRef}
        type="button"
        aria-labelledby={`${labelId} ${valueId}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => (open ? close() : openAt(CURRENCY_CODES.indexOf(value)))}
        onKeyDown={handleTriggerKeyDown}
        className={cn(
          "inline-flex h-11 items-center gap-2 border bg-[#0a0e0f] px-3 text-xs font-semibold text-white outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent",
          open
            ? "border-accent/60 focus-visible:border-accent"
            : "border-white/15 hover:border-white/30 focus-visible:border-accent",
        )}
      >
        <span id={valueId}>{value}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-white/50 transition-transform duration-200 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)]",
            open && "-rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          tabIndex={-1}
          onKeyDown={handleListKeyDown}
          className="dropdown-enter absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[9rem] border border-border bg-card py-1 shadow-[0_24px_50px_-18px_rgba(0,0,0,0.95)] focus:outline-none"
        >
          {CURRENCY_CODES.map((currency, index) => {
            const selected = currency === value;

            return (
              <li
                key={currency}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                onClick={() => commit(currency)}
                className={cn(
                  "flex cursor-pointer items-center justify-between gap-4 min-h-11 px-3 py-2 font-mono text-xs tracking-[0.14em] outline-none transition-colors",
                  index === activeIndex ? "bg-white/[0.07] text-white" : "text-white/60",
                  "hover:bg-white/[0.07] hover:text-white",
                )}
              >
                <span className={selected ? "text-accent" : undefined}>{currency}</span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
