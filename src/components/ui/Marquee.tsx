"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export function Marquee({
  items,
  className,
  speed = 40,
}: {
  items: string[];
  className?: string;
  speed?: number;
}) {
  const content = useMemo(() => {
    return items.map((item, i) => (
      <div
        key={`${item}-${i}`}
        className="flex items-center gap-8 px-8 shrink-0"
      >
        <span className="text-xl font-bold font-sans tracking-tight text-foreground whitespace-nowrap">
          {item}
        </span>
        <span className="text-accent text-glow">/</span>
      </div>
    ));
  }, [items]);

  return (
    <div
      className={cn(
        "relative flex w-full overflow-hidden whitespace-nowrap border-y border-white/5 bg-white/[0.02] py-6",
        className
      )}
      style={{
        "--duration": `${speed}s`,
        "--gap": "2rem",
      } as React.CSSProperties}
    >
      <div className="animate-marquee flex flex-row items-center whitespace-nowrap">
        {content}
        {content}
        {content}
        {content}
      </div>
    </div>
  );
}
