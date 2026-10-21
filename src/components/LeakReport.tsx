"use client";
import { AnimatePresence, motion } from "framer-motion";
import type { LeakReport as Report } from "@/lib/policy/leaks";
import { motionTokens } from "@/lib/motion-tokens";
import { ScoreRing } from "./ScoreRing";
import { SectionLabel } from "./ui";

export function LeakReport({ report, onSelect }: { report: Report; onSelect: (id: string) => void }) {
  const pct = Math.round(report.score * 100);
  return (
    <section aria-labelledby="leak-title" className="space-y-3 rounded-md border hairline p-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <ScoreRing score={report.score} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span data-testid="privacy-score" className="font-display text-2xl tabular-nums">
              {pct}%
            </span>
            <span className="font-mono text-[10px] text-muted">privacy</span>
          </div>
        </div>
        <div>
          <h2 id="leak-title" className="font-display text-lg">
            <span data-testid="leak-count" className={report.leaks.length ? "text-signal" : "text-accent"}>
              {report.leaks.length}
            </span>{" "}
            {report.leaks.length === 1 ? "leak" : "leaks"}
          </h2>
          <p className="text-sm text-muted">
            of {report.sensitiveEvents} sensitive sample events would be stored.
          </p>
        </div>
      </div>
      <SectionLabel>What still gets through</SectionLabel>
      <ul className="space-y-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {report.leaks.map(({ event: e }) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -motionTokens.distance.sm }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: motionTokens.distance.sm }}
              transition={{ duration: motionTokens.duration.fast, ease: motionTokens.easing.smooth }}
            >
              <button
                type="button"
                onClick={() => onSelect(e.id)}
                className="w-full rounded border border-signal/30 bg-signal/5 px-3 py-2 text-left hover:border-signal/60"
              >
                <span className="font-mono text-[11px] text-signal">
                  {e.timestamp.slice(11, 16)} · {e.sensitivity}
                </span>
                <span className="block font-display text-sm">{e.app_name}</span>
                <span className="block text-sm text-muted">{e.note}</span>
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
        {report.leaks.length === 0 && (
          <li className="rounded border border-accent/30 px-3 py-2 text-sm text-accent">
            Every sensitive trap in the sample day is dropped or redacted.
          </li>
        )}
      </ul>
    </section>
  );
}
