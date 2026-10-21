import { evaluatePolicy, evaluateEvent } from "@/lib/policy/evaluate";
import { validatePolicy } from "@/lib/policy/schema";
import { ev, pol } from "./helpers";

const chrome = (url: string | undefined, extra = {}) =>
  ev({ app_name: "Google Chrome", window_name: "Tab", browser_url: url, ...extra });

describe("evaluatePolicy basics", () => {
  it("returns one decision per event, in order", () => {
    const events = [ev({ id: "a" }), ev({ id: "b" })];
    const out = evaluatePolicy(pol(), events);
    expect(out.map((d) => d.eventId)).toEqual(["a", "b"]);
    expect(out.every((d) => d.decision === "captured")).toBe(true);
  });
  it("captured decisions keep the original text", () => {
    const [d] = evaluatePolicy(pol(), [ev({ text: "hello" })]);
    expect(d.outputText).toBe("hello");
    expect(d.reasons).toEqual([]);
  });
});

describe("ignoredWindows", () => {
  it("drops on case-insensitive substring match of app_name", () => {
    const d = evaluateEvent(pol({ ignoredWindows: ["1password"] }), ev({ app_name: "1Password 8" }));
    expect(d.decision).toBe("dropped");
    expect(d.reasons).toContain("ignoredWindows[0]: 1password");
    expect(d.outputText).toBe("");
  });
  it("drops on window_name match", () => {
    const d = evaluateEvent(
      pol({ ignoredWindows: ["slack", "PAYROLL"] }),
      ev({ app_name: "Microsoft Remote Desktop", window_name: "Remote Desktop - payroll-vm" }),
    );
    expect(d.decision).toBe("dropped");
    expect(d.reasons).toEqual(["ignoredWindows[1]: PAYROLL"]);
  });
  it("ignores blank patterns", () => {
    expect(evaluateEvent(pol({ ignoredWindows: [" "] }), ev()).decision).toBe("captured");
  });
});

describe("includedWindows", () => {
  it("an empty list allows everything", () => {
    expect(evaluateEvent(pol({ includedWindows: [] }), ev()).decision).toBe("captured");
  });
  it("drops events that match none", () => {
    const d = evaluateEvent(pol({ includedWindows: ["Linear"] }), ev({ app_name: "Slack" }));
    expect(d.decision).toBe("dropped");
    expect(d.reasons).toEqual(["includedWindows: no match"]);
  });
  it("keeps events that match one", () => {
    expect(evaluateEvent(pol({ includedWindows: ["linear", "slack"] }), ev()).decision).toBe("captured");
  });
});

describe("ignoredUrls", () => {
  it("legacy string matches subdomains", () => {
    const d = evaluateEvent(pol({ ignoredUrls: ["reddit.com"] }), chrome("https://old.reddit.com/r/x"));
    expect(d.decision).toBe("dropped");
    expect(d.reasons).toEqual(["ignoredUrls[0]: reddit.com (legacy, + subdomains)"]);
  });
  it("structured rule names includeSubdomains in its reason", () => {
    const d = evaluateEvent(
      pol({ ignoredUrls: ["x.com", "y.com", { domain: "chase.com", includeSubdomains: true }] }),
      chrome("https://online.chase.com"),
    );
    expect(d.reasons).toEqual(["ignoredUrls[2]: chase.com (includeSubdomains)"]);
  });
  it("structured rule without includeSubdomains lets subdomains through", () => {
    const d = evaluateEvent(pol({ ignoredUrls: [{ domain: "chase.com" }] }), chrome("https://online.chase.com"));
    expect(d.decision).toBe("captured");
  });
  it("does not affect events without a url", () => {
    expect(evaluateEvent(pol({ ignoredUrls: ["reddit.com"] }), ev()).decision).toBe("captured");
  });
});

describe("includedUrls (strict browser allowlist)", () => {
  const p = pol({ includedUrls: ["northstar.example", { domain: "google.com", includeSubdomains: true }] });
  it("keeps matching browser events", () => {
    expect(evaluateEvent(p, chrome("https://docs.google.com/sheets")).decision).toBe("captured");
  });
  it("drops non-matching browser events", () => {
    const d = evaluateEvent(p, chrome("https://reddit.com"));
    expect(d.decision).toBe("dropped");
    expect(d.reasons).toEqual(["includedUrls: no match"]);
  });
  it("drops browser events with no detected url", () => {
    const d = evaluateEvent(p, chrome(undefined));
    expect(d.decision).toBe("dropped");
    expect(d.reasons).toEqual(["includedUrls: no URL detected"]);
  });
  it("does not affect non-browser apps", () => {
    expect(evaluateEvent(p, ev({ app_name: "Visual Studio Code" })).decision).toBe("captured");
  });
});

describe("ignoreIncognitoWindows", () => {
  it("drops incognito events when on", () => {
    const d = evaluateEvent(pol({ ignoreIncognitoWindows: true }), chrome("https://bank.example", { incognito: true }));
    expect(d.decision).toBe("dropped");
    expect(d.reasons).toEqual(["ignoreIncognitoWindows"]);
  });
  it("keeps them when off", () => {
    const d = evaluateEvent(pol({ ignoreIncognitoWindows: false }), chrome("https://bank.example", { incognito: true }));
    expect(d.decision).toBe("captured");
  });
});

describe("schedule", () => {
  const p = pol({ schedule: [{ dayOfWeek: "tuesday", startTime: "08:00", endTime: "18:00" }] });
  it("empty schedule means always on", () => {
    expect(evaluateEvent(pol({ schedule: [] }), ev({ timestamp: "2026-10-20T23:59:00" })).decision).toBe("captured");
  });
  it("start bound is inclusive", () => {
    expect(evaluateEvent(p, ev({ timestamp: "2026-10-20T08:00:00" })).decision).toBe("captured");
  });
  it("end bound is exclusive (18:00 is outside)", () => {
    const d = evaluateEvent(p, ev({ timestamp: "2026-10-20T18:00:00" }));
    expect(d.decision).toBe("dropped");
    expect(d.reasons).toEqual(["schedule"]);
  });
  it("drops events on a different day", () => {
    const wed = pol({ schedule: [{ dayOfWeek: "wednesday", startTime: "00:00", endTime: "23:59" }] });
    expect(evaluateEvent(wed, ev({ timestamp: "2026-10-20T10:00:00" })).decision).toBe("dropped");
  });
  it("day names are case-insensitive", () => {
    const tue = pol({ schedule: [{ dayOfWeek: "Tuesday", startTime: "09:00", endTime: "10:00" }] });
    expect(evaluateEvent(tue, ev({ timestamp: "2026-10-20T09:30:00" })).decision).toBe("captured");
  });
});

describe("ignoredMeetingApps", () => {
  it("drops audio events from that app", () => {
    const d = evaluateEvent(
      pol({ ignoredMeetingApps: ["microsoft teams"] }),
      ev({ type: "Audio", app_name: "Microsoft Teams", window_name: "" }),
    );
    expect(d.decision).toBe("dropped");
    expect(d.reasons).toEqual(["ignoredMeetingApps[0]: microsoft teams"]);
  });
  it("does not drop screen events from the same app", () => {
    const d = evaluateEvent(pol({ ignoredMeetingApps: ["Microsoft Teams"] }), ev({ app_name: "Microsoft Teams" }));
    expect(d.decision).toBe("captured");
  });
  it("window filters do not apply to audio", () => {
    const d = evaluateEvent(pol({ ignoredWindows: ["zoom"] }), ev({ type: "Audio", app_name: "zoom.us" }));
    expect(d.decision).toBe("captured");
  });
});

describe("fail closed", () => {
  it("validation flags an empty structured domain", () => {
    const v = validatePolicy({ ignoredUrls: [{ domain: "" }] });
    expect(v.ok).toBe(false);
    expect(v.failClosed).toBe(true);
    expect(v.errors[0]).toMatch(/ignoredUrls\[0\]/);
  });
  it("engine drops all browser events when a url rule is invalid", () => {
    const p = pol({ ignoredUrls: [{ domain: " " }] });
    const d = evaluateEvent(p, chrome("https://docs.google.com"));
    expect(d.decision).toBe("dropped");
    expect(d.reasons).toEqual(["failClosed: invalid URL rule"]);
    expect(evaluateEvent(p, ev()).decision).toBe("captured");
  });
});

describe("multiple reasons", () => {
  it("collects every matching drop rule", () => {
    const d = evaluateEvent(
      pol({ ignoredWindows: ["chrome"], ignoreIncognitoWindows: true }),
      chrome("https://x.example", { incognito: true }),
    );
    expect(d.reasons).toEqual(["ignoredWindows[0]: chrome", "ignoreIncognitoWindows"]);
  });
});

describe("redaction in evaluation", () => {
  it("marks captured events with matches as redacted", () => {
    const d = evaluateEvent(
      pol({ redact: { categories: ["api_key"] } }),
      ev({ text: "export OPENAI_API_KEY=sk-proj-FAKEdemo1234567890abcd" }),
    );
    expect(d.decision).toBe("redacted");
    expect(d.outputText).toBe("export OPENAI_API_KEY=[REDACTED:api_key]");
    expect(d.spans).toHaveLength(1);
    expect(d.reasons).toEqual(["redact.api_key ×1"]);
  });
});
