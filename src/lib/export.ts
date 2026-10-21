import { sampleDay } from "../../fixtures/sample-day";
import { evaluatePolicy } from "./policy/evaluate";
import { leakReport } from "./policy/leaks";
import { toMarkdownReport } from "./policy/report";
import type { Policy } from "./policy/schema";

export function makeReportBlob(policy: Policy, policyName: string, generatedAt = new Date().toISOString()): Blob {
  const decisions = evaluatePolicy(policy, sampleDay);
  const md = toMarkdownReport({
    policy,
    events: sampleDay,
    decisions,
    leaks: leakReport(decisions, sampleDay),
    generatedAt,
    policyName,
  });
  return new Blob([md], { type: "text/markdown" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
