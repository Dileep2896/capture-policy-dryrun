import { leakReport, isLeak } from "@/lib/policy/leaks";
import { evaluatePolicy } from "@/lib/policy/evaluate";
import { ev, pol } from "./helpers";

const events = [
  ev({ id: "ok", sensitivity: "none" }),
  ev({ id: "pw", app_name: "1Password", sensitivity: "credential", note: "vault" }),
  ev({ id: "key", text: "KEY=sk-proj-AbC123_def-456ghij789", sensitivity: "secret", sensitive_text: "sk-proj-AbC123_def-456ghij789" }),
  ev({ id: "chat", app_name: "WhatsApp", sensitivity: "personal" }),
];

describe("leakReport", () => {
  it("counts sensitive events that are captured", () => {
    const r = leakReport(evaluatePolicy(pol(), events), events);
    expect(r.sensitiveEvents).toBe(3);
    expect(r.leaks.map((l) => l.event.id)).toEqual(["pw", "key", "chat"]);
    expect(r.score).toBe(0);
    expect(r.bySensitivity).toEqual({ credential: 1, secret: 1, personal: 1 });
  });
  it("redaction that removes the sensitive text is not a leak", () => {
    const p = pol({ ignoredWindows: ["1Password"], redact: { categories: ["api_key"] } });
    const r = leakReport(evaluatePolicy(p, events), events);
    expect(r.leaks.map((l) => l.event.id)).toEqual(["chat"]);
    expect(r.score).toBeCloseTo(2 / 3);
  });
  it("redacted events without a sensitive_text are still leaks", () => {
    const e = ev({ text: "mail a@b.example", sensitivity: "personal" });
    const [d] = evaluatePolicy(pol({ redact: { categories: ["email"] } }), [e]);
    expect(d.decision).toBe("redacted");
    expect(isLeak(e, d)).toBe(true);
  });
  it("score is 1 with no sensitive events", () => {
    const e = [ev()];
    expect(leakReport(evaluatePolicy(pol(), e), e).score).toBe(1);
  });
});
