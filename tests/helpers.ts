import type { CaptureEvent } from "@/lib/source/types";
import type { Policy } from "@/lib/policy/schema";
import { emptyPolicy } from "@/lib/policy/schema";

let n = 0;
export function ev(partial: Partial<CaptureEvent> = {}): CaptureEvent {
  n += 1;
  return {
    id: partial.id ?? `t${n}`,
    type: "UI",
    timestamp: "2026-10-20T10:00:00",
    app_name: "Slack",
    window_name: "#finance - Northstar",
    text: "standup notes",
    sensitivity: "none",
    ...partial,
  };
}

export function pol(partial: Partial<Policy> = {}): Policy {
  return { ...emptyPolicy(), ...partial };
}
