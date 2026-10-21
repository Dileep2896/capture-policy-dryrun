import { diffPolicies } from "@/lib/policy/diff";
import { ev, pol } from "./helpers";

const events = [
  ev({ id: "a", app_name: "1Password", sensitivity: "credential" }),
  ev({ id: "b", app_name: "Slack" }),
  ev({ id: "c", text: "mail a@b.example" }),
  ev({ id: "d", app_name: "Notion" }),
];

describe("diffPolicies", () => {
  it("lists only changed events with counts", () => {
    const a = pol({ ignoredWindows: ["Notion"] });
    const b = pol({ ignoredWindows: ["1Password"], redact: { categories: ["email"] } });
    const d = diffPolicies(a, b, events);
    expect(d.changed.map((c) => c.event.id)).toEqual(["a", "c", "d"]);
    expect(d.counts).toEqual({ newlyDropped: 1, newlyCaptured: 1, newlyRedacted: 1, leaksFixed: 1, leaksIntroduced: 0 });
    expect(d.scoreA).toBe(0);
    expect(d.scoreB).toBe(1);
  });
  it("identical policies produce no changes", () => {
    const d = diffPolicies(pol(), pol(), events);
    expect(d.changed).toEqual([]);
    expect(d.counts.newlyDropped).toBe(0);
  });
  it("counts leaks introduced", () => {
    const d = diffPolicies(pol({ ignoredWindows: ["1Password"] }), pol(), events);
    expect(d.counts.leaksIntroduced).toBe(1);
    expect(d.counts.newlyCaptured).toBe(1);
  });
});
