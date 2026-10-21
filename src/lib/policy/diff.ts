import type { CaptureEvent } from "../source/types";
import type { Policy } from "./schema";
import { evaluatePolicy, type Decision } from "./evaluate";
import { isLeak, leakReport } from "./leaks";

export type ChangedEvent = { event: CaptureEvent; before: Decision; after: Decision; leakBefore: boolean; leakAfter: boolean };
export type PolicyDiff = {
  changed: ChangedEvent[];
  counts: { newlyDropped: number; newlyCaptured: number; newlyRedacted: number; leaksFixed: number; leaksIntroduced: number };
  scoreA: number;
  scoreB: number;
};

export function diffPolicies(a: Policy, b: Policy, events: readonly CaptureEvent[]): PolicyDiff {
  const da = evaluatePolicy(a, events);
  const db = evaluatePolicy(b, events);
  const counts = { newlyDropped: 0, newlyCaptured: 0, newlyRedacted: 0, leaksFixed: 0, leaksIntroduced: 0 };
  const changed: ChangedEvent[] = [];
  events.forEach((event, i) => {
    const before = da[i];
    const after = db[i];
    const leakBefore = isLeak(event, before);
    const leakAfter = isLeak(event, after);
    if (before.decision === after.decision && leakBefore === leakAfter) return;
    changed.push({ event, before, after, leakBefore, leakAfter });
    if (before.decision !== after.decision) {
      if (after.decision === "dropped") counts.newlyDropped += 1;
      else if (after.decision === "captured") counts.newlyCaptured += 1;
      else counts.newlyRedacted += 1;
    }
    if (leakBefore && !leakAfter) counts.leaksFixed += 1;
    if (!leakBefore && leakAfter) counts.leaksIntroduced += 1;
  });
  return { changed, counts, scoreA: leakReport(da, events).score, scoreB: leakReport(db, events).score };
}
