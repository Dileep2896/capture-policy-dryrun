"use client";
import { useMemo, useState } from "react";
import { sampleDay } from "../../fixtures/sample-day";
import { diffPolicies } from "@/lib/policy/diff";
import { useDryRunStore } from "@/lib/store";
import { usePolicy } from "@/lib/usePolicy";
import { PolicyEditor } from "./PolicyEditor";
import { DiffSummary } from "./DiffSummary";
import { SectionLabel } from "./ui";

export function CompareWorkspace() {
  const { compareA, compareB, setCompare } = useDryRunStore();
  const [nameA, setNameA] = useState("Draft enterprise (leaky)");
  const [nameB, setNameB] = useState("Hardened enterprise");
  const a = usePolicy(compareA);
  const b = usePolicy(compareB);
  const diff = useMemo(() => diffPolicies(a.policy, b.policy, sampleDay), [a.policy, b.policy]);

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">What does this rule change actually change?</h1>
        <p className="mt-1 text-lg text-muted">
          Diff two capture policies over the same sample day. Every changed event, every leak fixed or introduced.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-2">
          <SectionLabel>Policy A · {nameA}</SectionLabel>
          <PolicyEditor
            id="policy-compare-a"
            label="Policy A JSON"
            value={compareA}
            validation={a.validation}
            onChange={(t) => {
              setCompare("A", t);
              setNameA("Custom policy");
            }}
            onPreset={(p) => {
              setCompare("A", JSON.stringify(p.policy, null, 2));
              setNameA(p.name);
            }}
            activePreset={nameA}
          />
        </section>
        <section className="space-y-2">
          <SectionLabel>Policy B · {nameB}</SectionLabel>
          <PolicyEditor
            id="policy-compare-b"
            label="Policy B JSON"
            value={compareB}
            validation={b.validation}
            onChange={(t) => {
              setCompare("B", t);
              setNameB("Custom policy");
            }}
            onPreset={(p) => {
              setCompare("B", JSON.stringify(p.policy, null, 2));
              setNameB(p.name);
            }}
            activePreset={nameB}
          />
        </section>
      </div>
      <DiffSummary diff={diff} />
    </main>
  );
}
