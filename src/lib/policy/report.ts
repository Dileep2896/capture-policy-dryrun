import type { CaptureEvent } from "../source/types";
import type { Policy } from "./schema";
import type { Decision } from "./evaluate";
import type { LeakReport } from "./leaks";

export function ruleHitCounts(decisions: readonly Decision[]): { rule: string; hits: number }[] {
  const m = new Map<string, number>();
  for (const d of decisions) {
    if (d.decision !== "dropped") continue;
    for (const r of d.reasons) m.set(r, (m.get(r) ?? 0) + 1);
  }
  return [...m].map(([rule, hits]) => ({ rule, hits })).sort((a, b) => b.hits - a.hits || a.rule.localeCompare(b.rule));
}

const cell = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");
export const timeOf = (ts: string) => ts.slice(11, 16);
export const pct = (x: number) => `${Math.round(x * 100)}%`;

export function toMarkdownReport(input: {
  policy: Policy;
  events: readonly CaptureEvent[];
  decisions: readonly Decision[];
  leaks: LeakReport;
  generatedAt: string;
  policyName?: string;
}): string {
  const { policy, events, decisions, leaks, generatedAt, policyName } = input;
  const count = (k: Decision["decision"]) => decisions.filter((d) => d.decision === k).length;
  const lines: string[] = [
    "# Privacy review",
    "",
    `Capture policy dry-run${policyName ? ` for **${policyName}**` : ""}, generated ${generatedAt}.`,
    `Evaluated against ${events.length} sample capture events. No device recorded anything.`,
    "",
    "## Summary",
    "",
    "| Metric | Value |",
    "|---|---|",
    `| Events captured | ${count("captured")} |`,
    `| Events captured with redactions | ${count("redacted")} |`,
    `| Events dropped | ${count("dropped")} |`,
    `| Sensitive events in sample | ${leaks.sensitiveEvents} |`,
    `| Leaks | ${leaks.leaks.length} |`,
    `| Privacy score | ${pct(leaks.score)} |`,
    "",
    "## Leaks",
    "",
  ];
  if (leaks.leaks.length === 0) {
    lines.push("No sensitive sample event would be stored.");
  } else {
    lines.push("| Time | App | Window / URL | Sensitivity | Decision | Why it matters |", "|---|---|---|---|---|---|");
    for (const { event: e, decision: d } of leaks.leaks) {
      lines.push(
        `| ${timeOf(e.timestamp)} | ${cell(e.app_name)} | ${cell(e.browser_url ?? e.window_name)} | ${e.sensitivity} | ${d.decision} | ${cell(e.note ?? "")} |`,
      );
    }
  }
  lines.push("", "## Drop rules and hit counts", "");
  const hits = ruleHitCounts(decisions);
  if (hits.length === 0) lines.push("No rule dropped any event.");
  else {
    lines.push("| Rule | Events dropped |", "|---|---|");
    for (const h of hits) lines.push(`| \`${cell(h.rule)}\` | ${h.hits} |`);
  }
  lines.push("", "## Policy", "", "```json", JSON.stringify(policy, null, 2), "```", "");
  return lines.join("\n");
}
