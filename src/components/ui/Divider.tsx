export function Divider({ className = "" }: { className?: string }) {
  return (
    <div className={`h-[1px] w-full bg-gradient-to-r from-transparent via-white/20 to-transparent ${className}`} />
  );
}
