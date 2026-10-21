import { validatePolicy, parsePolicyJson } from "@/lib/policy/schema";

describe("validatePolicy", () => {
  it("fills defaults for an empty object", () => {
    const v = validatePolicy({});
    expect(v.ok).toBe(true);
    expect(v.policy?.ignoredWindows).toEqual([]);
    expect(v.policy?.ignoreIncognitoWindows).toBe(false);
  });
  it("rejects wrong types with a path", () => {
    const v = validatePolicy({ ignoredWindows: "1Password" });
    expect(v.ok).toBe(false);
    expect(v.policy).toBeUndefined();
    expect(v.errors[0]).toMatch(/ignoredWindows/);
  });
  it("rejects bad times and unknown redact categories", () => {
    const v = validatePolicy({
      schedule: [{ dayOfWeek: "tuesday", startTime: "8am", endTime: "18:00" }],
      redact: { categories: ["ssn"] },
    });
    expect(v.ok).toBe(false);
    expect(v.errors.join("\n")).toMatch(/schedule\.0\.startTime/);
    expect(v.errors.join("\n")).toMatch(/redact\.categories\.0/);
  });
  it("rejects an unknown day", () => {
    expect(validatePolicy({ schedule: [{ dayOfWeek: "funday", startTime: "08:00", endTime: "18:00" }] }).ok).toBe(false);
  });
});

describe("parsePolicyJson", () => {
  it("reports invalid JSON without throwing", () => {
    const v = parsePolicyJson("{ not json");
    expect(v.ok).toBe(false);
    expect(v.errors[0]).toMatch(/Invalid JSON/);
  });
  it("parses valid JSON", () => {
    expect(parsePolicyJson('{"ignoredWindows":["1Password"]}').ok).toBe(true);
  });
});
