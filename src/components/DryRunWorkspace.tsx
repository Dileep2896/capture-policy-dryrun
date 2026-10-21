"use client";
import { useEffect, useMemo, useRef } from "react";
import { Download } from "lucide-react";
import { sampleDay } from "../../fixtures/sample-day";
import { evaluatePolicy } from "@/lib/policy/evaluate";
import { leakReport } from "@/lib/policy/leaks";
import { loadSavedPolicy, savePolicy, useDryRunStore } from "@/lib/store";
import { usePolicy } from "@/lib/usePolicy";
import { downloadBlob, makeReportBlob } from "@/lib/export";
import { PolicyEditor } from "./PolicyEditor";
import { EventTimeline } from "./EventTimeline";
import { EventTable } from "./EventTable";
import { EventDetail } from "./EventDetail";
import { LeakReport } from "./LeakReport";
import { SectionLabel } from "./ui";

export function DryRunWorkspace() {
  const { policyText, policyName, selectedEventId, filter, setPolicyText, select, setFilter } = useDryRunStore();
  const { validation, policy } = usePolicy(policyText);
  const decisions = useMemo(() => evaluatePolicy(policy, sampleDay), [policy]);
  const report = useMemo(() => leakReport(decisions, sampleDay), [decisions]);
  const idx = sampleDay.findIndex((e) => e.id === selectedEventId);

  const hydrated = useRef(false);
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const saved = loadSavedPolicy();
    if (saved && saved !== policyText) setPolicyText(saved, "Saved draft");
  }, [policyText, setPolicyText]);
  useEffect(() => {
    if (hydrated.current) savePolicy(policyText);
  }, [policyText]);

  const counts = {
    captured: decisions.filter((d) => d.decision === "captured").length,
    redacted: decisions.filter((d) => d.decision === "redacted").length,
    dropped: decisions.filter((d) => d.decision === "dropped").length,
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Dry-run a capture policy before it records anything</h1>
          <p className="mt-1 text-lg text-muted">
            {sampleDay.length} capture events from a fictional ops analyst&apos;s Tuesday, run through your policy with
            the same filter semantics a screen-recording agent applies.
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadBlob(makeReportBlob(policy, policyName), "privacy-review.md")}
          className="inline-flex items-center gap-2 rounded-md bg-paper px-4 py-2 font-display text-sm text-ink transition hover:bg-accent"
        >
          <Download size={16} aria-hidden /> Export review
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <aside className="space-y-6">
          <section className="space-y-2">
            <SectionLabel>Capture policy · {policyName}</SectionLabel>
            <PolicyEditor
              id="policy-a"
              label="Capture policy JSON"
              value={policyText}
              validation={validation}
              onChange={(t) => setPolicyText(t)}
              onPreset={(p) => setPolicyText(JSON.stringify(p.policy, null, 2), p.name)}
              activePreset={policyName}
            />
          </section>
          <LeakReport report={report} onSelect={select} />
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-wrap gap-6 font-mono text-xs">
            <span>
              <b className="font-display text-xl tabular-nums">{counts.captured}</b> captured
            </span>
            <span>
              <b className="font-display text-xl tabular-nums">{counts.redacted}</b> redacted
            </span>
            <span className="text-muted">
              <b className="font-display text-xl tabular-nums">{counts.dropped}</b> dropped
            </span>
          </div>
          <EventTimeline events={sampleDay} decisions={decisions} selectedId={selectedEventId} onSelect={select} />
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
            <EventTable
              events={sampleDay}
              decisions={decisions}
              filter={filter}
              onFilter={setFilter}
              selectedId={selectedEventId}
              onSelect={select}
            />
            <EventDetail event={sampleDay[idx]} decision={decisions[idx]} />
          </div>
        </section>
      </div>
    </main>
  );
}
