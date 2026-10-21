"use client";
import { PRESETS, type Preset } from "@/lib/policy/presets";
import type { Validation } from "@/lib/policy/schema";
import { cn } from "@/lib/cn";

export function PolicyEditor({
  id,
  label,
  value,
  validation,
  onChange,
  onPreset,
  activePreset,
}: {
  id: string;
  label: string;
  value: string;
  validation: Validation;
  onChange: (text: string) => void;
  onPreset: (p: Preset) => void;
  activePreset?: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Preset policies">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            title={p.blurb}
            onClick={() => onPreset(p)}
            className={cn(
              "rounded-full border px-3 py-1 font-display text-xs transition-colors",
              activePreset === p.name ? "border-paper bg-paper text-ink" : "hairline text-muted hover:border-paper/40 hover:text-paper",
            )}
          >
            {p.name}
          </button>
        ))}
      </div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        aria-label={label}
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!validation.ok}
        className={cn(
          "h-[340px] w-full resize-y rounded-md border bg-surface p-3 font-mono text-[12px] leading-relaxed text-paper outline-none",
          "focus-visible:ring-2 focus-visible:ring-accent/60",
          validation.ok ? "hairline" : "border-signal/60",
        )}
      />
      {!validation.ok && (
        <div role="alert" className="rounded-md border border-signal/40 bg-signal/10 p-3 font-mono text-[11px] text-signal">
          {validation.failClosed && <p className="mb-1 font-display text-xs">Fail closed: every browser event is dropped.</p>}
          {!validation.policy && <p className="mb-1 font-display text-xs">Showing results for the last valid policy.</p>}
          <ul className="space-y-0.5">
            {validation.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
