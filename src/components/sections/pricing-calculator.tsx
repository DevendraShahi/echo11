"use client";

import { useMemo, useState } from "react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { PRICING_PLANS } from "@/lib/content";
import { trackEvent } from "@/lib/analytics";

export function PricingCalculator() {
  const [billing, setBilling] = useState<"annual" | "monthly">("annual");
  const [teamSize, setTeamSize] = useState(6);

  const estimate = useMemo(() => {
    const base = billing === "annual" ? PRICING_PLANS[1].annual : PRICING_PLANS[1].monthly;
    const multiplier = Math.max(1, teamSize / 6);
    return Math.round(base * multiplier);
  }, [billing, teamSize]);

  const handleBillingChange = (next: string) => {
    if (next !== "annual" && next !== "monthly") {
      return;
    }

    setBilling(next);
    trackEvent("pricing_toggle", { value: next });
  };

  return (
    <section className="pricing-calculator">
      <SegmentedControl
        name="billing"
        label="Billing period"
        value={billing}
        onChange={handleBillingChange}
        options={[
          { label: "Annual", value: "annual" },
          { label: "Monthly", value: "monthly" },
        ]}
      />

      <div className="pricing-card-grid">
        {PRICING_PLANS.map((plan, index) => {
          const amount = billing === "annual" ? plan.annual : plan.monthly;
          const emphasized = index === 1;

          return (
            <article
              key={plan.id}
              className={`pricing-card chassis-panel ${emphasized ? "pricing-card-featured border-accent" : ""}`.trim()}
            >
              <span className="chassis-seam-tl" aria-hidden="true"></span>
              <p className="pricing-name text-accent font-mono uppercase tracking-wide text-xs">{plan.name}</p>
              <p className="pricing-cost mt-2">${amount.toLocaleString()}</p>
              <p className="pricing-period">per month</p>
              <p className="pricing-lead mb-6 mt-2 text-text-2">{plan.lead}</p>

              <ul className="flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm">{feature}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>

      <div className="estimate-shell" aria-live="polite">
        <label htmlFor="team-size">Estimated team size: {teamSize}</label>
        <input
          id="team-size"
          type="range"
          min={3}
          max={24}
          step={1}
          value={teamSize}
          onChange={(event) => setTeamSize(Number(event.target.value))}
        />
        <p>Projected monthly engagement: ${estimate.toLocaleString()}</p>
      </div>
    </section>
  );
}
