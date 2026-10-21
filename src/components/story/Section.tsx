"use client";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion-tokens";

export const container = (reduce: boolean | null) => ({
  hidden: {},
  visible: { transition: reduce ? {} : { staggerChildren: motionTokens.stagger, delayChildren: 0.05 } },
});

export function useItem() {
  const reduce = useReducedMotion();
  return reduce
    ? { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } }
    : {
        hidden: { opacity: 0, y: motionTokens.distance.lg },
        visible: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.slow, ease: motionTokens.easing.smooth } },
      };
}

export function Section({ id, eyebrow, children }: { id: string; eyebrow: string; children: React.ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id={id}
      aria-labelledby={`${id}-title`}
      className="mx-auto flex min-h-[92vh] max-w-6xl flex-col justify-center gap-8 px-4 py-20"
      variants={container(reduce)}
      initial={reduce ? "visible" : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      <Eyebrow>{eyebrow}</Eyebrow>
      {children}
    </motion.section>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  const item = useItem();
  return (
    <motion.p variants={item} className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
      {children}
    </motion.p>
  );
}

export function Reveal({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "h1" | "h2" | "p" | "blockquote" }) {
  const item = useItem();
  const M = motion[as];
  return (
    <M variants={item} className={className}>
      {children}
    </M>
  );
}
