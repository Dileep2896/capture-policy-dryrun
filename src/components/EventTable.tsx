"use client";
import type { CaptureEvent } from "@/lib/source/types";
import type { Decision } from "@/lib/policy/evaluate";
import { isLeak } from "@/lib/policy/leaks";
import type { Filter } from "@/lib/store";
import { cn } from "@/lib/cn";
import { DecisionBadge } from "./ui";

const FILTERS: Filter[] = ["all", "leaks", "captured", "redacted", "dropped"];

export function EventTable({
  events,
  decisions,
  filter,
  onFilter,
  selectedId,
  onSelect,
}: {
  events: readonly CaptureEvent[];
  decisions: readonly Decision[];
  filter: Filter;
  onFilter: (f: Filter) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const rows = events
    .map((e, i) => ({ e, d: decisions[i], leak: isLeak(e, decisions[i]) }))
    .filter(({ d, leak }) => (filter === "all" ? true : filter === "leaks" ? leak : d.decision === filter));

  return (
    <div className="flex min-h-0 flex-col rounded-md border hairline">
      <div className="flex flex-wrap items-center gap-1.5 border-b hairline p-2" role="group" aria-label="Filter events">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              "rounded px-2 py-0.5 font-mono text-[11px]",
              filter === f ? "bg-paper text-ink" : "text-muted hover:text-paper",
            )}
          >
            {f}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-muted">{rows.length} events</span>
      </div>
      <div className="max-h-[520px] overflow-auto">
        <table className="w-full table-fixed text-left text-sm">
          <thead className="sticky top-0 bg-ink font-display text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="w-14 px-2 py-1.5 font-normal">Time</th>
              <th className="w-32 px-2 py-1.5 font-normal">App</th>
              <th className="px-2 py-1.5 font-normal">Window / URL</th>
              <th className="w-28 px-2 py-1.5 font-normal">Decision</th>
              <th className="hidden w-64 px-2 py-1.5 font-normal md:table-cell">Reason</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ e, d, leak }) => (
              <tr
                key={e.id}
                data-testid="event-row"
                tabIndex={0}
                aria-selected={selectedId === e.id}
                onClick={() => onSelect(e.id)}
                onKeyDown={(k) => (k.key === "Enter" || k.key === " ") && onSelect(e.id)}
                className={cn(
                  "cursor-pointer border-t hairline align-top transition-colors hover:bg-paper/5 focus:outline-none focus-visible:bg-paper/10",
                  selectedId === e.id && "bg-paper/10",
                  d.decision === "dropped" && "text-muted",
                )}
              >
                <td className="px-2 py-1.5 font-mono text-[11px] text-muted">{e.timestamp.slice(11, 16)}</td>
                <td className="truncate px-2 py-1.5 font-display text-xs">
                  {e.type === "Audio" ? "♪ " : ""}
                  {e.app_name}
                </td>
                <td className="truncate px-2 py-1.5 font-mono text-[11px]">{e.browser_url ?? e.window_name}</td>
                <td className="px-2 py-1.5">
                  <DecisionBadge kind={d.decision} leak={leak} />
                </td>
                <td className="hidden truncate px-2 py-1.5 font-mono text-[11px] text-muted md:table-cell">{d.reasons.join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
