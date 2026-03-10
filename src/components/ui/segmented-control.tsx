"use client";

import { KeyboardEvent } from "react";

type SegmentedOption = {
  value: string;
  label: string;
};

type SegmentedControlProps = {
  name: string;
  label: string;
  value: string;
  options: SegmentedOption[];
  onChange: (value: string) => void;
};

export function SegmentedControl({
  name,
  label,
  value,
  options,
  onChange,
}: SegmentedControlProps) {
  const handleArrowNavigation = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const currentIndex = options.findIndex((option) => option.value === value);
    const direction = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1;
    const nextIndex = (currentIndex + direction + options.length) % options.length;
    onChange(options[nextIndex].value);
  };

  return (
    <div
      className="segmented"
      role="radiogroup"
      aria-label={label}
      onKeyDown={handleArrowNavigation}
    >
      {options.map((option) => {
        const checked = option.value === value;

        return (
          <label key={option.value} className={checked ? "segmented-item is-selected" : "segmented-item"}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={checked}
              onChange={() => onChange(option.value)}
            />
            <span role="radio" aria-checked={checked} tabIndex={checked ? 0 : -1}>
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
