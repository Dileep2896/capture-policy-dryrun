import { toMarkdownReport, ruleHitCounts } from "@/lib/policy/report";
import { evaluatePolicy } from "@/lib/policy/evaluate";
import { leakReport } from "@/lib/policy/leaks";
import { ev, pol } from "./helpers";

const events = [
  ev({ id: "e1", timestamp: "2026-10-20T09:00:00", app_name: "1Password", sensitivity: "credential", note: "Password vault" }),
  ev({ id: "e2", timestamp: "2026-10-20T09:05:00", app_name: "WhatsApp", sensitivity: "personal", note: "Personal chat" }),
  ev({ id: "e3", timestamp: "2026-10-20T09:10:00", text: "ping a@b.example" }),
  ev({ id: "e4", timestamp: "2026-10-20T09:15:00", app_name: "1Password 8" }),
];
const policy = pol({ ignoredWindows: ["1Password"], redact: { categories: ["email"] } });

describe("ruleHitCounts", () => {
  it("counts drop rules by key", () => {
    const decisions = evaluatePolicy(policy, events);
    expect(ruleHitCounts(decisions)).toEqual([{ rule: "ignoredWindows[0]: 1Password", hits: 2 }]);
  });
});

describe("toMarkdownReport", () => {
  it("renders a stable privacy review", () => {
    const decisions = evaluatePolicy(policy, events);
    const md = toMarkdownReport({
      policy,
      events,
      decisions,
      leaks: leakReport(decisions, events),
      generatedAt: "2026-10-21T00:00:00Z",
      policyName: "Test policy",
    });
    expect(md).toContain("# Privacy review");
    expect(md).toContain("| 09:05 | WhatsApp |");
    expect(md).toMatchSnapshot();
  });
});
