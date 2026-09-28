import { PixelCanvas } from "@/components/ui/pixel-canvas";

type ServiceGridProps = React.ComponentProps<"div"> & {
  items: { name: string; icon: React.ElementType }[];
};

export function ServiceBand({ items }: ServiceGridProps) {
  // Brand colors: Cyan, White, Muted Cyan, Dark Cyan
  const pixelColors = ["#00E5FF", "#FFFFFF", "#008B99", "#80F2FF"];

  const renderServiceCard = (item: { name: string; icon: React.ElementType }, idx: number) => {
    const Icon = item.icon;
    return (
      <div
        key={`service-${item.name}-${idx}`}
        className="group relative flex h-32 md:h-48 cursor-default items-center justify-center overflow-hidden bg-[#050505] transition-all duration-300 hover:bg-[#111]"
      >
        <PixelCanvas colors={pixelColors} gap={6} speed={30} />
        <div className="relative z-10 flex flex-col items-center gap-3 px-4 text-center">
          <Icon className="h-6 w-6 md:h-8 md:w-8 text-white/40 transition-all duration-300 group-hover:scale-110 group-hover:text-white" />
          <span className="font-mono text-sm md:text-base font-bold text-white/50 transition-all duration-300 group-hover:scale-105 group-hover:text-white">
            {item.name}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 md:px-6 pb-12 md:pb-20">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-[1px] bg-white/10 border border-white/10 overflow-hidden">
        {/* Top 6 items (first row + middle left) */}
        {items.slice(0, 5).map(renderServiceCard)}
        {items.slice(5, 6).map(renderServiceCard)}

        {/* Center Block */}
        <div className="col-span-2 md:col-span-3 flex flex-col items-center justify-center p-8 md:p-12 bg-[#050505] text-center relative z-20">
           <h2 className="text-xl md:text-3xl lg:text-4xl font-sans font-bold tracking-tight text-white">
              Built for teams that need a serious digital product partner.
           </h2>
        </div>

        {/* Bottom 6 items (middle right + bottom row) */}
        {items.slice(6, 7).map(renderServiceCard)}
        {items.slice(7, 12).map(renderServiceCard)}
      </div>
    </div>
  );
}
