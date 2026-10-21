import { create } from "zustand";
import { presetById } from "./policy/presets";

export type Filter = "all" | "leaks" | "captured" | "redacted" | "dropped";

const pretty = (id: Parameters<typeof presetById>[0]) => JSON.stringify(presetById(id).policy, null, 2);

type State = {
  policyText: string;
  policyName: string;
  compareA: string;
  compareB: string;
  selectedEventId: string | null;
  filter: Filter;
  setPolicyText: (t: string, name?: string) => void;
  setCompare: (side: "A" | "B", t: string) => void;
  select: (id: string | null) => void;
  setFilter: (f: Filter) => void;
  reset: () => void;
};

const initial = () => ({
  policyText: pretty("leaky"),
  policyName: presetById("leaky").name,
  compareA: pretty("leaky"),
  compareB: pretty("hardened"),
  selectedEventId: null,
  filter: "all" as Filter,
});

export const useDryRunStore = create<State>((set) => ({
  ...initial(),
  setPolicyText: (policyText, name) => set({ policyText, policyName: name ?? "Custom policy" }),
  setCompare: (side, t) => set(side === "A" ? { compareA: t } : { compareB: t }),
  select: (selectedEventId) => set({ selectedEventId }),
  setFilter: (filter) => set({ filter }),
  reset: () => set(initial()),
}));

export const presetText = pretty;

const KEY = "capture-policy-dryrun:last-policy";
export function loadSavedPolicy(): string | null {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
export function savePolicy(text: string) {
  try {
    window.localStorage.setItem(KEY, text);
  } catch {
    /* storage blocked: the demo still works in memory */
  }
}
