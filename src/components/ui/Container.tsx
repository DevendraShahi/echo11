export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full px-[var(--page-gutter)] lg:px-[var(--page-gutter-wide)] max-w-[var(--width-content)] ${className || ""}`}
    >
      {children}
    </div>
  );
}
