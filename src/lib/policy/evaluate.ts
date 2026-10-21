import type { CaptureEvent } from "../source/types";
import type { Policy } from "./schema";
import { DAYS, urlRuleErrors } from "./schema";
import { describeUrlRule, matchUrlRule } from "./url";
import { redactText, type Span } from "./redact";

export type DecisionKind = "captured" | "dropped" | "redacted";

export type Decision = {
  eventId: string;
  decision: DecisionKind;
  /** Human-readable matching rules, e.g. `ignoredUrls[2]: chase.com (includeSubdomains)`. */
  reasons: string[];
  /** Text that would be stored ("" when dropped). */
  outputText: string;
  /** Redaction spans over the original `text`. */
  spans: Span[];
};

const BROWSERS = [
  "google chrome",
  "chrome",
  "chromium",
  "safari",
  "firefox",
  "arc",
  "microsoft edge",
  "brave browser",
  "opera",
  "vivaldi",
];

export function isBrowser(e: CaptureEvent): boolean {
  if (e.type === "Audio") return false;
  return Boolean(e.browser_url) || BROWSERS.includes(e.app_name.trim().toLowerCase());
}

const ci = (hay: string, needle: string) => hay.toLowerCase().includes(needle.toLowerCase());

function minutesOf(ts: string): number {
  const m = /T(\d{2}):(\d{2})/.exec(ts);
  return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
}

function dayOf(ts: string): (typeof DAYS)[number] {
  const [y, mo, d] = ts.slice(0, 10).split("-").map(Number);
  return DAYS[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
}

const hhmm = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));

function inSchedule(policy: Policy, ts: string): boolean {
  if (policy.schedule.length === 0) return true;
  const day = dayOf(ts);
  const t = minutesOf(ts);
  return policy.schedule.some(
    (w) => w.dayOfWeek.toLowerCase() === day && t >= hhmm(w.startTime) && t < hhmm(w.endTime),
  );
}

function dropReasons(policy: Policy, e: CaptureEvent, failClosed: boolean): string[] {
  const reasons: string[] = [];
  const screen = e.type !== "Audio";

  if (screen) {
    policy.ignoredWindows.forEach((w, i) => {
      if (w.trim() && (ci(e.app_name, w) || ci(e.window_name, w))) reasons.push(`ignoredWindows[${i}]: ${w}`);
    });
    const included = policy.includedWindows.filter((w) => w.trim());
    if (included.length && !included.some((w) => ci(e.app_name, w) || ci(e.window_name, w))) {
      reasons.push("includedWindows: no match");
    }
  }

  if (isBrowser(e)) {
    if (failClosed) {
      reasons.push("failClosed: invalid URL rule");
    } else {
      policy.ignoredUrls.forEach((r, i) => {
        if (matchUrlRule(r, e.browser_url)) reasons.push(`ignoredUrls[${i}]: ${describeUrlRule(r)}`);
      });
      if (policy.includedUrls.length) {
        if (!e.browser_url) reasons.push("includedUrls: no URL detected");
        else if (!policy.includedUrls.some((r) => matchUrlRule(r, e.browser_url))) reasons.push("includedUrls: no match");
      }
    }
  }

  if (screen && policy.ignoreIncognitoWindows && e.incognito) reasons.push("ignoreIncognitoWindows");
  if (!inSchedule(policy, e.timestamp)) reasons.push("schedule");

  if (e.type === "Audio") {
    policy.ignoredMeetingApps.forEach((a, i) => {
      if (a.trim() && ci(e.app_name, a)) reasons.push(`ignoredMeetingApps[${i}]: ${a}`);
    });
  }
  return reasons;
}

function evaluateWith(policy: Policy, e: CaptureEvent, failClosed: boolean): Decision {
  const reasons = dropReasons(policy, e, failClosed);
  if (reasons.length) return { eventId: e.id, decision: "dropped", reasons, outputText: "", spans: [] };

  const { text, spans } = redactText(e.text, policy.redact.categories);
  if (!spans.length) return { eventId: e.id, decision: "captured", reasons: [], outputText: e.text, spans: [] };

  const counts = new Map<string, number>();
  for (const s of spans) counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  return {
    eventId: e.id,
    decision: "redacted",
    reasons: [...counts].map(([c, n]) => `redact.${c} ×${n}`),
    outputText: text,
    spans,
  };
}

export function evaluateEvent(policy: Policy, e: CaptureEvent): Decision {
  return evaluateWith(policy, e, urlRuleErrors(policy).length > 0);
}

export function evaluatePolicy(policy: Policy, events: readonly CaptureEvent[]): Decision[] {
  const failClosed = urlRuleErrors(policy).length > 0;
  return events.map((e) => evaluateWith(policy, e, failClosed));
}
