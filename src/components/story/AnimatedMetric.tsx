"use client";
import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion-tokens";

/** Counts from `from` to `to` once it scrolls into view. Reduced motion renders the final value. */
export function AnimatedMetric({
  from,
  to,
  suffix = "",
  className,
  testId,
}: {
  from: number;
  to: number;
  suffix?: string;
  className?: string;
  testId?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.textContent = `${to}${suffix}`;
      return;
    }
    if (!inView) return;
    const controls = animate(from, to, {
      duration: motionTokens.duration.story,
      ease: motionTokens.easing.smooth,
      delay: 0.3,
      onUpdate: (v) => {
        el.textContent = `${Math.round(v)}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, from, to, suffix]);

  return (
    <span ref={ref} data-testid={testId} className={className}>
      {reduce ? to : from}
      {suffix}
    </span>
  );
}
