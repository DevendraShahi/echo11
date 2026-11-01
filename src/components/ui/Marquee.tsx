"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function Marquee({
  items,
  className,
  speed = 40,
  label,
}: {
  items: string[];
  className?: string;
  speed?: number;
  label?: string;
}) {
  const content = useMemo(() => {
    return items.map((item, i) => (
      <div key={`${item}-${i}`} className="flex shrink-0 items-center gap-7 px-7">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] whitespace-nowrap text-white/45">
          {item}
        </span>
        <span className="h-3 w-px shrink-0 bg-accent/40" aria-hidden="true" />
      </div>
    ));
  }, [items]);

  return (
    <div
      className={cn(
        "relative flex w-full items-center gap-6 overflow-hidden border-y border-white/10 bg-black py-4",
        className
      )}
      style={
        {
          "--duration": `${speed}s`,
          "--gap": "2rem",
        } as React.CSSProperties
      }
    >
      {label ? (
        <span className="hidden shrink-0 border-r border-white/10 pl-6 pr-6 font-mono text-[11px] uppercase tracking-[0.2em] text-accent md:inline-block lg:pl-0">
          {label}
        </span>
      ) : null}
      <div className="animate-marquee flex flex-row items-center whitespace-nowrap">
        {content}
        {content}
        {content}
        {content}
      </div>
    </div>
  );
}
