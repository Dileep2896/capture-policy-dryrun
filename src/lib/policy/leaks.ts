import type { CaptureEvent, Sensitivity } from "../source/types";
import type { Decision } from "./evaluate";

export type Leak = { event: CaptureEvent; decision: Decision };
export type LeakReport = {
  leaks: Leak[];
  sensitiveEvents: number;
  /** 1 - leaks / sensitiveEvents (1 when nothing is sensitive). */
  score: number;
  bySensitivity: Partial<Record<Exclude<Sensitivity, "none">, number>>;
};

export function isLeak(e: CaptureEvent, d: Decision): boolean {
  if (e.sensitivity === "none" || d.decision === "dropped") return false;
  if (d.decision === "captured") return true;
  return !e.sensitive_text || d.outputText.includes(e.sensitive_text);
}

export function leakReport(decisions: readonly Decision[], events: readonly CaptureEvent[]): LeakReport {
  const byId = new Map(decisions.map((d) => [d.eventId, d]));
  const leaks: Leak[] = [];
  const bySensitivity: LeakReport["bySensitivity"] = {};
  let sensitiveEvents = 0;
  for (const e of events) {
    if (e.sensitivity === "none") continue;
    sensitiveEvents += 1;
    const d = byId.get(e.id);
    if (d && isLeak(e, d)) {
      leaks.push({ event: e, decision: d });
      bySensitivity[e.sensitivity] = (bySensitivity[e.sensitivity] ?? 0) + 1;
    }
  }
  return {
    leaks,
    sensitiveEvents,
    score: sensitiveEvents === 0 ? 1 : 1 - leaks.length / sensitiveEvents,
    bySensitivity,
  };
}
