"use client";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion-tokens";

export function ScoreRing({ score, size = 112 }: { score: number; size?: number }) {
  const reduce = useReducedMotion();
  const r = 44;
  const c = 2 * Math.PI * r;
  const color = score >= 1 ? "rgb(var(--accent))" : score >= 0.8 ? "rgb(var(--paper))" : "rgb(var(--signal))";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgb(var(--paper) / 0.1)" strokeWidth="6" />
      <motion.circle
        cx="50"
        cy="50"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={c}
        transform="rotate(-90 50 50)"
        initial={false}
        animate={{ strokeDashoffset: c * (1 - score) }}
        transition={reduce ? { duration: 0 } : { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth }}
      />
    </svg>
  );
}
