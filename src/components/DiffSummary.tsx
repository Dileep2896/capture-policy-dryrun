"use client";
import type { PolicyDiff } from "@/lib/policy/diff";
import { DecisionBadge, SectionLabel } from "./ui";

const LABELS: [keyof PolicyDiff["counts"], string][] = [
  ["newlyDropped", "newly dropped"],
  ["newlyCaptured", "newly captured"],
  ["newlyRedacted", "newly redacted"],
  ["leaksFixed", "leaks fixed"],
  ["leaksIntroduced", "leaks introduced"],
];

export function DiffSummary({ diff }: { diff: PolicyDiff }) {
  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-md border hairline p-3">
          <p className="font-display text-2xl tabular-nums">
            {Math.round(diff.scoreA * 100)}→{Math.round(diff.scoreB * 100)}%
          </p>
          <p className="font-mono text-[11px] text-muted">privacy score</p>
        </div>
        {LABELS.map(([k, label]) => (
          <div key={k} className="rounded-md border hairline p-3">
            <p
              data-testid={`count-${k}`}
              className={
                "font-display text-2xl tabular-nums " +
                (k === "leaksFixed" && diff.counts[k] ? "text-accent" : k === "leaksIntroduced" && diff.counts[k] ? "text-signal" : "")
              }
            >
              {diff.counts[k]}
            </p>
            <p className="font-mono text-[11px] text-muted">{label}</p>
          </div>
        ))}
      </div>
      <SectionLabel>{diff.changed.length} events change between A and B</SectionLabel>
      <div className="overflow-auto rounded-md border hairline">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="font-display text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-2 py-1.5 font-normal">Time</th>
              <th className="px-2 py-1.5 font-normal">App / URL</th>
              <th className="px-2 py-1.5 font-normal">A</th>
              <th className="px-2 py-1.5 font-normal">B</th>
              <th className="px-2 py-1.5 font-normal">Why B decides this</th>
            </tr>
          </thead>
          <tbody>
            {diff.changed.map((c) => (
              <tr key={c.event.id} data-testid="changed-row" className="border-t hairline align-top">
                <td className="px-2 py-1.5 font-mono text-[11px] text-muted">{c.event.timestamp.slice(11, 16)}</td>
                <td className="px-2 py-1.5">
                  <span className="font-display text-xs">{c.event.app_name}</span>
                  <span className="block truncate font-mono text-[11px] text-muted">{c.event.browser_url ?? c.event.window_name}</span>
                </td>
                <td className="px-2 py-1.5">
                  <DecisionBadge kind={c.before.decision} leak={c.leakBefore} />
                </td>
                <td className="px-2 py-1.5">
                  <DecisionBadge kind={c.after.decision} leak={c.leakAfter} />
                </td>
                <td className="px-2 py-1.5 font-mono text-[11px] text-muted">{c.after.reasons.join(" · ") || "no rule matched"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
