"use client";
import { motion, useReducedMotion } from "framer-motion";
import { Monitor, ListTree, Mic, Database, Bot, Plug } from "lucide-react";
import { motionTokens } from "@/lib/motion-tokens";

const SOURCES = [
  { icon: Monitor, label: "screen frames" },
  { icon: ListTree, label: "accessibility tree" },
  { icon: Mic, label: "audio + transcripts" },
];
const SINKS = [
  { icon: Plug, label: "MCP" },
  { icon: Bot, label: "local REST API" },
];

/** Capture sources flow into local SQLite and out to agents. */
export function PolicyFlow() {
  const reduce = useReducedMotion();
  const pulse = (delay: number) =>
    reduce
      ? {}
      : {
          animate: { x: ["0%", "100%"], opacity: [0, 1, 1, 0] },
          transition: { duration: 1.8, delay, repeat: Infinity, ease: "linear" as const },
        };
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6" aria-label="screen capture data flow">
      <ul className="space-y-2">
        {SOURCES.map(({ icon: Icon, label }, i) => (
          <motion.li
            key={label}
            initial={reduce ? false : { opacity: 0, x: -motionTokens.distance.lg }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: motionTokens.duration.slow, delay: i * motionTokens.stagger, ease: motionTokens.easing.smooth }}
            className="relative flex items-center gap-2 overflow-hidden rounded-md border hairline bg-surface px-3 py-2 font-display text-xs sm:text-sm"
          >
            <Icon size={16} aria-hidden className="shrink-0 text-muted" /> {label}
            <motion.span aria-hidden className="absolute bottom-0 left-0 h-px w-8 bg-paper/70" {...pulse(i * 0.4)} />
          </motion.li>
        ))}
      </ul>
      <motion.div
        initial={reduce ? false : { scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: motionTokens.duration.slow, delay: 0.3, ease: motionTokens.easing.smooth }}
        className="flex flex-col items-center gap-1 rounded-xl border border-paper/30 bg-paper/5 px-3 py-4 sm:px-6"
      >
        <Database size={28} aria-hidden />
        <span className="font-mono text-[10px] text-muted sm:text-xs">local SQLite</span>
      </motion.div>
      <ul className="space-y-2">
        {SINKS.map(({ icon: Icon, label }, i) => (
          <motion.li
            key={label}
            initial={reduce ? false : { opacity: 0, x: motionTokens.distance.lg }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: motionTokens.duration.slow, delay: 0.5 + i * motionTokens.stagger, ease: motionTokens.easing.smooth }}
            className="flex items-center gap-2 rounded-md border hairline bg-surface px-3 py-2 font-display text-xs sm:text-sm"
          >
            <Icon size={16} aria-hidden className="shrink-0 text-muted" /> {label}
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
