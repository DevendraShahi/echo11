export function Badge({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variants = {
    default: "border-transparent bg-accent text-accent-foreground shadow-[0_0_10px_var(--accent-glow)]",
    outline: "text-accent border border-accent shadow-[0_0_5px_var(--accent-glow)]",
    ghost: "bg-white/10 text-foreground border border-white/5",
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </div>
  );
}
