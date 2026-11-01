import type { WebsiteDirection } from "@/lib/website-offers";

interface WebsiteDirectionPreviewProps {
  direction: WebsiteDirection;
  className?: string;
}

const metaClass = "font-mono text-[8px] uppercase tracking-[0.16em] text-white/45";

/**
 * A coded direction study: the content shows the page hierarchy and buyer path,
 * not a finished client identity or a result claim. Keep each study in Echo11's
 * dark/cyan palette so the catalogue reads as one system.
 */
export function WebsiteDirectionPreview({ direction, className = "" }: WebsiteDirectionPreviewProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative isolate min-h-[17rem] overflow-hidden border border-white/10 bg-[#070a0b] ${className}`}
    >
      {direction.preview === "commerce" && <CommercePreview />}
      {direction.preview === "service" && <ServicePreview />}
      {direction.preview === "product" && <ProductPreview />}
    </div>
  );
}

function PreviewHeader({ children, action }: { children: React.ReactNode; action: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/15 pb-3">
      <span className="font-sans text-[10px] font-bold uppercase tracking-[0.14em] text-white">{children}</span>
      <span className={metaClass}>{action}</span>
    </div>
  );
}

function CommercePreview() {
  return (
    <div className="flex h-full min-h-[22rem] flex-col p-4 text-white sm:min-h-[29rem] sm:p-6">
      <PreviewHeader action="Bag · 0">Shop <span className="px-2 text-accent">/</span> Routine</PreviewHeader>
      <div className="grid flex-1 gap-4 py-5 sm:grid-cols-[1.05fr_0.95fr] sm:py-7">
        <div className="flex flex-col justify-between">
          <div>
            <p className={metaClass}>Build a routine</p>
            <h4 className="mt-3 max-w-[10ch] font-sans text-[clamp(1.5rem,3vw,3.25rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
              Care, without the guesswork.
            </h4>
            <p className="mt-4 max-w-[35ch] font-sans text-[11px] leading-5 text-white/55 sm:text-xs sm:leading-6">
              Start with the concern, understand the ingredients, and find the products that work together.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-3 self-start border-b border-accent/70 pb-2 font-mono text-[8px] uppercase tracking-[0.13em] text-accent">
            Find your routine <span aria-hidden="true">↗</span>
          </div>
        </div>
        <div className="grid min-h-40 grid-cols-2 gap-2 sm:min-h-56 sm:gap-3">
          <div className="relative flex flex-col justify-between overflow-hidden border border-white/10 bg-[#0d1314] p-3 sm:p-4">
            <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/40">01 / Cleanse</span>
            <div className="mx-auto flex h-20 w-14 items-center justify-center border border-accent/35 bg-black/40 sm:h-28 sm:w-[4.5rem]">
              <div className="h-12 w-6 border border-white/30 sm:h-16 sm:w-7" />
            </div>
            <span className="font-sans text-[9px] leading-4 text-white/70 sm:text-[10px]">Daily cleanser</span>
          </div>
          <div className="relative flex flex-col justify-between border border-white/10 bg-[#0d1314] p-3 sm:p-4">
            <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/40">02 / Restore</span>
            <div className="mx-auto flex h-20 w-14 items-center justify-center border border-white/20 bg-black/40 sm:h-28 sm:w-[4.5rem]">
              <div className="h-10 w-8 border border-accent/60 sm:h-14 sm:w-10" />
            </div>
            <span className="font-sans text-[9px] leading-4 text-white/70 sm:text-[10px]">Barrier serum</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-white/15 pt-3">
        {["Shop by concern", "Ingredient notes", "Product detail"].map((item, index) => (
          <div key={item} className={`pr-2 ${index > 0 ? "border-l border-white/10 pl-2 sm:pl-4" : ""}`}>
            <span className={`${metaClass} text-[7px]`}>0{index + 1}</span>
            <p className="mt-1.5 font-sans text-[8px] leading-4 text-white/65 sm:text-[10px]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ServicePreview() {
  return (
    <div className="flex h-full min-h-[22rem] flex-col p-4 text-white sm:min-h-[29rem] sm:p-6">
      <PreviewHeader action="Approach · Work · Contact">Independent practice</PreviewHeader>
      <div className="grid flex-1 gap-5 py-5 sm:grid-cols-[1.1fr_0.9fr] sm:py-7">
        <div className="flex flex-col justify-between">
          <div>
            <p className={metaClass}>A clear offer, backed by evidence</p>
            <h4 className="mt-3 max-w-[11ch] font-sans text-[clamp(1.5rem,3vw,3.25rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
              Make your expertise easier to choose.
            </h4>
            <p className="mt-4 max-w-[36ch] font-sans text-[11px] leading-5 text-white/55 sm:text-xs sm:leading-6">
              Explain who you help, what changes, and why your approach is the right fit.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-3 self-start border-b border-accent/70 pb-2 font-mono text-[8px] uppercase tracking-[0.13em] text-accent">
            Start a conversation <span aria-hidden="true">↗</span>
          </div>
        </div>
        <div className="flex flex-col border-l border-white/10 pl-4 sm:pl-6">
          <p className={metaClass}>A decision path</p>
          <ol className="mt-3 flex-1 divide-y divide-white/10 border-y border-white/10">
            {[
              ["01", "Understand the need"],
              ["02", "See the approach"],
              ["03", "Review relevant work"],
              ["04", "Request a conversation"],
            ].map(([number, label]) => (
              <li key={number} className="flex items-start gap-3 py-3">
                <span className="font-mono text-[8px] tabular-nums text-accent">{number}</span>
                <span className="font-sans text-[9px] leading-4 text-white/70 sm:text-[10px]">{label}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 font-mono text-[7px] uppercase leading-4 tracking-[0.1em] text-white/35">Clear scope · Relevant proof · Better enquiry</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-3">
        <span className={metaClass}>Service overview</span>
        <span className="font-mono text-[7px] uppercase tracking-[0.12em] text-white/35">Offer → Evidence → Enquiry</span>
      </div>
    </div>
  );
}

function ProductPreview() {
  return (
    <div className="flex h-full min-h-[22rem] flex-col p-4 text-white sm:min-h-[29rem] sm:p-6">
      <PreviewHeader action="Product · Use cases · Sign in">Digital product</PreviewHeader>
      <div className="grid flex-1 gap-4 py-5 sm:grid-cols-[0.9fr_1.1fr] sm:py-7">
        <div className="flex flex-col justify-between">
          <div>
            <p className={metaClass}>For the work behind the workflow</p>
            <h4 className="mt-3 max-w-[10ch] font-sans text-[clamp(1.5rem,3vw,3.25rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
              One product. A clearer way through.
            </h4>
            <p className="mt-4 max-w-[35ch] font-sans text-[11px] leading-5 text-white/55 sm:text-xs sm:leading-6">
              Lead with the user problem, show the workflow, then make the next step easy to understand.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-3 self-start border-b border-accent/70 pb-2 font-mono text-[8px] uppercase tracking-[0.13em] text-accent">
            See how it works <span aria-hidden="true">↗</span>
          </div>
        </div>
        <div className="flex flex-col border border-white/10 bg-[#0b1011] p-3 sm:p-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className={metaClass}>Learning workspace</span>
            <span className="h-1.5 w-1.5 bg-accent" />
          </div>
          <div className="grid flex-1 grid-cols-[3.3rem_1fr] gap-3 pt-3 sm:grid-cols-[4.5rem_1fr] sm:gap-4">
            <div className="space-y-2 border-r border-white/10 pr-2">
              {["Course", "Lessons", "Practice", "Progress"].map((item, index) => (
                <div key={item} className={`py-1 font-mono text-[7px] ${index === 1 ? "border-l border-accent pl-2 text-accent" : "text-white/35"}`}>{item}</div>
              ))}
            </div>
            <div className="flex flex-col justify-between">
              <div>
                <p className={metaClass}>Current module</p>
                <p className="mt-2 font-sans text-[11px] font-semibold leading-4 text-white sm:text-sm">Build the core idea</p>
                <div className="mt-4 h-px bg-white/10"><div className="h-px w-2/3 bg-accent" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="border border-white/10 p-2 sm:p-3">
                  <p className={metaClass}>Lesson</p>
                  <p className="mt-1.5 font-sans text-[8px] text-white/65 sm:text-[9px]">Concept &amp; example</p>
                </div>
                <div className="border border-white/10 p-2 sm:p-3">
                  <p className={metaClass}>Practice</p>
                  <p className="mt-1.5 font-sans text-[8px] text-white/65 sm:text-[9px]">Try the workflow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 border-t border-white/15 pt-3">
        {["Use-case story", "Product walkthrough", "Trial or demo"].map((item, index) => (
          <div key={item} className={`pr-2 ${index > 0 ? "border-l border-white/10 pl-2 sm:pl-4" : ""}`}>
            <span className={`${metaClass} text-[7px]`}>0{index + 1}</span>
            <p className="mt-1.5 font-sans text-[8px] leading-4 text-white/65 sm:text-[10px]">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
