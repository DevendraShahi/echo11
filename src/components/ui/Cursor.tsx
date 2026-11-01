"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "motion/react";
import { AudioWaveformIcon, type AudioWaveformIconHandle } from "@/components/ui/AudioWaveformIcon";
import { getOnboardingProgress } from "@/components/onboarding/OnboardingChecklist";

/** Interactive elements quicken the waveform; fields keep native cursors. */
const INTERACTIVE = "a, button, [role='button'], label";
const FIELDS = "input, textarea, select";

/**
 * A cursor that tracks the pointer exactly. Position is written straight to
 * the wrapper's transform inside one shared rAF — no React state, no springs —
 * so the waveform and label never lag behind or drift apart. State is only touched when what's under the pointer changes.
 */
export function Cursor() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const waveformRef = useRef<AudioWaveformIconHandle>(null);
  const reduced = useReducedMotion();
  const pathname = usePathname();
  /** Latest pointer facts, kept in refs so moving never re-renders. */
  const xRef = useRef(-100);
  const yRef = useRef(-100);
  const visibleRef = useRef(false);
  const hoverRef = useRef(false);
  const fieldRef = useRef(false);
  const labelRef = useRef<string | null>(null);

  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isField, setIsField] = useState(false);
  const [isOnboardingCompleted, setIsOnboardingCompleted] = useState(false);
  /**
   * The label of whatever is under the pointer. An element names itself by
   * carrying `data-cursor`, so the surface that knows what a thing is does not
   * have to know how the cursor is drawn, and the cursor does not have to know
   * what exists on the page.
   */
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const checkOnboarding = () => {
      const progress = getOnboardingProgress();
      setIsOnboardingCompleted(progress.total > 0 && progress.completed >= progress.total);
    };

    checkOnboarding();
    window.addEventListener("echo11:onboarding:update", checkOnboarding);
    return () => window.removeEventListener("echo11:onboarding:update", checkOnboarding);
  }, []);

  useEffect(() => {
    let frame = 0;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

    const render = () => {
      frame = 0;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      wrapper.style.transform = `translate3d(${xRef.current}px, ${yRef.current}px, 0)`;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !finePointer.matches) return;
      if (!wrapperRef.current) return;
      xRef.current = event.clientX;
      yRef.current = event.clientY;
      // Coalesce to at most one transform write per frame.
      if (!frame) frame = window.requestAnimationFrame(render);

      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }

      const target = event.target as Element | null;
      const hovered = !!target?.closest(INTERACTIVE);
      const onField = !!target?.closest(FIELDS);
      const nextLabel = target?.closest("[data-cursor]")?.getAttribute("data-cursor") ?? null;
      if (hovered !== hoverRef.current) {
        hoverRef.current = hovered;
        setIsHovered(hovered);
      }
      if (onField !== fieldRef.current) {
        fieldRef.current = onField;
        setIsField(onField);
      }
      if (nextLabel !== labelRef.current) {
        labelRef.current = nextLabel;
        setLabel(nextLabel);
      }
    };

    // mouseleave does not bubble: fires once on real exit, not element hops.
    const handleLeave = () => {
      if (!visibleRef.current) return;
      visibleRef.current = false;
      setIsVisible(false);
    };

    const handlePointerChange = () => { if (!finePointer.matches) handleLeave(); };
    finePointer.addEventListener("change", handlePointerChange);
    window.addEventListener("blur", handleLeave);
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      finePointer.removeEventListener("change", handlePointerChange);
      window.removeEventListener("blur", handleLeave);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  const showMarks =
    isVisible &&
    !isField &&
    !isOnboardingCompleted &&
    !pathname.startsWith("/laltin") &&
    !pathname.startsWith("/pizzaslice");

  useEffect(() => {
    document.documentElement.classList.toggle("echo-wave-cursor", showMarks);
    return () => document.documentElement.classList.remove("echo-wave-cursor");
  }, [showMarks]);

  useEffect(() => {
    if (showMarks && !reduced) waveformRef.current?.startAnimation();
    else waveformRef.current?.stopAnimation();
  }, [showMarks, reduced, isHovered]);

  if (isOnboardingCompleted) return null;
  if (pathname.startsWith("/laltin") || pathname.startsWith("/pizzaslice")) return null;

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[100]"
      style={{ transform: "translate3d(-100px, -100px, 0)" }}
    >
      <AudioWaveformIcon
        ref={waveformRef}
        size={28}
        duration={isHovered ? 0.65 : 1}
        isAnimated={!reduced}
        className={`absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 text-accent transition-[opacity,transform] duration-150 motion-reduce:transition-none ${showMarks ? "opacity-100" : "opacity-0"} ${isHovered ? "scale-110" : "scale-100"}`}
      />
      {label && showMarks && (
        <span className="absolute left-4 top-4 bg-accent px-4 py-2 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-black">
          {label}
        </span>
      )}
    </div>
  );
}
