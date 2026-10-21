import type { DecisionKind } from "@/lib/policy/evaluate";
import { cn } from "@/lib/cn";

export function DecisionBadge({ kind, leak }: { kind: DecisionKind; leak?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 font-mono text-[11px] leading-none",
        kind === "captured" && "border-paper/40 text-paper",
        kind === "redacted" && "border-paper/25 bg-paper/10 text-paper",
        kind === "dropped" && "border-muted/30 text-muted",
        leak && "border-signal/70 text-signal",
      )}
    >
      {leak ? "leak · " : ""}
      {kind}
    </span>
  );
}

export const decisionColor = (kind: DecisionKind, leak: boolean) =>
  leak ? "rgb(var(--signal))" : kind === "dropped" ? "rgb(var(--muted) / 0.45)" : kind === "redacted" ? "rgb(var(--paper) / 0.6)" : "rgb(var(--paper))";

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="font-display text-xs uppercase tracking-[0.18em] text-muted">{children}</h2>;
}
