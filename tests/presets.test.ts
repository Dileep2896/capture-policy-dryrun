import { PRESETS } from "@/lib/policy/presets";
import { evaluatePolicy } from "@/lib/policy/evaluate";
import { leakReport } from "@/lib/policy/leaks";
import { validatePolicy } from "@/lib/policy/schema";
import { sampleDay } from "@fixtures/sample-day";

const score = (id: string) => {
  const p = PRESETS.find((x) => x.id === id)!.policy;
  const d = evaluatePolicy(p, sampleDay);
  return { d, r: leakReport(d, sampleDay) };
};

describe("sample day fixture", () => {
  it("has about 120 events with unique ids on Tuesday 2026-10-20", () => {
    expect(sampleDay.length).toBeGreaterThanOrEqual(110);
    expect(sampleDay.length).toBeLessThanOrEqual(130);
    expect(new Set(sampleDay.map((e) => e.id)).size).toBe(sampleDay.length);
    expect(sampleDay.every((e) => e.timestamp.startsWith("2026-10-20T"))).toBe(true);
  });
  it("is sorted by time and includes every sensitivity label", () => {
    const ts = sampleDay.map((e) => e.timestamp);
    expect([...ts].sort()).toEqual(ts);
    const labels = new Set(sampleDay.map((e) => e.sensitivity));
    for (const l of ["none", "secret", "personal", "financial", "credential"]) expect(labels.has(l as never)).toBe(true);
  });
  it("includes audio and incognito events", () => {
    expect(sampleDay.some((e) => e.type === "Audio")).toBe(true);
    expect(sampleDay.some((e) => e.incognito)).toBe(true);
  });
});

describe("preset contract", () => {
  it("all presets validate", () => {
    for (const p of PRESETS) expect(validatePolicy(p.policy).ok).toBe(true);
  });
  it("hardened enterprise scores 100% with 0 leaks", () => {
    const { r } = score("hardened");
    expect(r.leaks).toHaveLength(0);
    expect(r.score).toBe(1);
  });
  it("draft enterprise (leaky) scores 70% or less", () => {
    expect(score("leaky").r.score).toBeLessThanOrEqual(0.7);
  });
  it("default consumer keeps every non-sensitive work event", () => {
    const { d } = score("consumer");
    const dropped = d.filter((x, i) => x.decision === "dropped" && sampleDay[i].sensitivity === "none");
    expect(dropped).toEqual([]);
  });
  it("hardened enterprise still keeps most work events (no over-blocking)", () => {
    const { d } = score("hardened");
    const work = sampleDay.filter((e) => e.sensitivity === "none").length;
    const kept = d.filter((x, i) => x.decision !== "dropped" && sampleDay[i].sensitivity === "none").length;
    expect(kept / work).toBeGreaterThan(0.9);
  });
});
