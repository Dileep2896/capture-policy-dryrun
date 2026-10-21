"use client";
import type { CaptureEvent } from "@/lib/source/types";
import type { Decision } from "@/lib/policy/evaluate";
import { isLeak } from "@/lib/policy/leaks";
import { decisionColor } from "./ui";

const START = 8 * 60;
const END = 20 * 60;
const minutes = (ts: string) => Number(ts.slice(11, 13)) * 60 + Number(ts.slice(14, 16)) + Number(ts.slice(17, 19) || 0) / 60;

export function EventTimeline({
  events,
  decisions,
  selectedId,
  onSelect,
}: {
  events: readonly CaptureEvent[];
  decisions: readonly Decision[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const hours = Array.from({ length: 13 }, (_, i) => 8 + i);
  return (
    <div className="rounded-md border hairline bg-surface/60 p-3">
      <svg viewBox="0 0 1000 64" className="h-16 w-full" role="img" aria-label="Sample day timeline, one tick per event colored by decision">
        {hours.map((h) => {
          const x = ((h * 60 - START) / (END - START)) * 1000;
          return (
            <g key={h}>
              <line x1={x} x2={x} y1={8} y2={48} stroke="rgb(var(--paper) / 0.08)" />
              <text x={x} y={62} fill="rgb(var(--muted))" fontSize="10" textAnchor="middle" fontFamily="var(--font-mono)">
                {String(h).padStart(2, "0")}
              </text>
            </g>
          );
        })}
        {events.map((e, i) => {
          const d = decisions[i];
          const x = ((minutes(e.timestamp) - START) / (END - START)) * 1000;
          const leak = isLeak(e, d);
          const audio = e.type === "Audio";
          return (
            <rect
              key={e.id}
              x={x - 1.5}
              y={audio ? 30 : leak ? 6 : 12}
              width={3}
              height={audio ? 16 : leak ? 40 : 16}
              rx={1}
              fill={decisionColor(d.decision, leak)}
              stroke={selectedId === e.id ? "rgb(var(--accent))" : "none"}
              strokeWidth={2}
              className="cursor-pointer"
              onClick={() => onSelect(e.id)}
            >
              <title>{`${e.timestamp.slice(11, 16)} ${e.app_name}: ${d.decision}${leak ? " (leak)" : ""}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[10px] text-muted">
        <span><i className="mr-1 inline-block h-2 w-2 bg-paper" />captured</span>
        <span><i className="mr-1 inline-block h-2 w-2 bg-paper/60" />redacted</span>
        <span><i className="mr-1 inline-block h-2 w-2 bg-muted/45" />dropped</span>
        <span><i className="mr-1 inline-block h-2 w-2 bg-signal" />leak</span>
        <span>lower lane: audio</span>
      </div>
    </div>
  );
}
