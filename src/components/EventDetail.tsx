"use client";
import type { CaptureEvent } from "@/lib/source/types";
import type { Decision } from "@/lib/policy/evaluate";
import { isLeak } from "@/lib/policy/leaks";
import { DecisionBadge, SectionLabel } from "./ui";

function Highlighted({ text, decision }: { text: string; decision: Decision }) {
  if (!decision.spans.length) return <>{text}</>;
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  decision.spans.forEach((s, i) => {
    parts.push(text.slice(cursor, s.start));
    parts.push(
      <mark key={i} className="rounded-sm bg-paper/15 px-0.5 text-paper line-through decoration-muted" title={`redacted: ${s.category}`}>
        {text.slice(s.start, s.end)}
      </mark>,
    );
    cursor = s.end;
  });
  parts.push(text.slice(cursor));
  return <>{parts}</>;
}

export function EventDetail({ event, decision }: { event?: CaptureEvent; decision?: Decision }) {
  if (!event || !decision) {
    return (
      <div data-testid="event-detail" className="rounded-md border border-dashed hairline p-4 text-sm text-muted">
        Select an event on the timeline or in the table to see exactly what would be stored and which rule decided it.
      </div>
    );
  }
  const leak = isLeak(event, decision);
  return (
    <div data-testid="event-detail" className="space-y-3 rounded-md border hairline bg-surface/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <DecisionBadge kind={decision.decision} leak={leak} />
        <span className="font-mono text-[11px] text-muted">
          {event.timestamp.slice(11, 16)} · {event.type} · {event.id}
        </span>
      </div>
      <div>
        <p className="font-display text-sm">{event.app_name}</p>
        <p className="break-all font-mono text-[11px] text-muted">{event.browser_url ?? event.window_name}</p>
        {event.incognito && <p className="font-mono text-[11px] text-muted">incognito: true</p>}
      </div>
      <div>
        <SectionLabel>Matched rules</SectionLabel>
        {decision.reasons.length ? (
          <ul className="mt-1 space-y-0.5 font-mono text-[11px]">
            {decision.reasons.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 font-mono text-[11px] text-muted">none, stored as captured</p>
        )}
      </div>
      <div>
        <SectionLabel>Sample text</SectionLabel>
        <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed">
          <Highlighted text={event.text} decision={decision} />
        </pre>
      </div>
      <div>
        <SectionLabel>What the recorder would store</SectionLabel>
        <pre className="mt-1 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-paper/80">
          {decision.decision === "dropped" ? "nothing (frame dropped before OCR / storage)" : decision.outputText}
        </pre>
      </div>
      {event.sensitivity !== "none" && (
        <p className={leak ? "text-sm text-signal" : "text-sm text-muted"}>
          Ground truth: {event.sensitivity}. {event.note}
          {leak ? " This would be stored." : " Protected."}
        </p>
      )}
    </div>
  );
}
