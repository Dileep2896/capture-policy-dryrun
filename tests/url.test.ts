import { normalizeHost, matchLegacyUrl, matchDomainRule, matchUrlRule } from "@/lib/policy/url";

describe("normalizeHost", () => {
  it("lowercases, drops scheme, port, path and trailing dot", () => {
    expect(normalizeHost("HTTPS://Online.CHASE.com.:8443/path?q=1")).toBe("online.chase.com");
  });
  it("accepts bare hosts", () => {
    expect(normalizeHost("reddit.com/r/all")).toBe("reddit.com");
  });
  it("strips a leading www.", () => {
    expect(normalizeHost("https://www.reddit.com/")).toBe("reddit.com");
  });
  it("returns null for empty or garbage input", () => {
    expect(normalizeHost("")).toBeNull();
    expect(normalizeHost("   ")).toBeNull();
    expect(normalizeHost("http://")).toBeNull();
  });
});

describe("matchLegacyUrl (string rule)", () => {
  it("matches the domain itself", () => {
    expect(matchLegacyUrl("reddit.com", "https://reddit.com/r/all")).toBe(true);
  });
  it("matches subdomains", () => {
    expect(matchLegacyUrl("reddit.com", "https://old.reddit.com/")).toBe(true);
  });
  it("does not match lookalike suffixes", () => {
    expect(matchLegacyUrl("reddit.com", "https://notreddit.com/")).toBe(false);
  });
  it("handles www. and uppercase on both sides", () => {
    expect(matchLegacyUrl("WWW.Reddit.com", "https://WWW.REDDIT.COM/")).toBe(true);
  });
});

describe("matchDomainRule (structured rule)", () => {
  it("always matches the exact domain", () => {
    expect(matchDomainRule({ domain: "chase.com" }, "https://chase.com/")).toBe(true);
  });
  it("does not match descendants unless includeSubdomains", () => {
    expect(matchDomainRule({ domain: "chase.com" }, "https://online.chase.com/")).toBe(false);
    expect(matchDomainRule({ domain: "chase.com", includeSubdomains: true }, "https://online.chase.com/")).toBe(true);
  });
  it("treats www. as the exact domain", () => {
    expect(matchDomainRule({ domain: "chase.com" }, "https://www.chase.com/")).toBe(true);
  });
  it("never matches descendants rooted at excludedSubdomains", () => {
    const rule = { domain: "chase.com", includeSubdomains: true, excludedSubdomains: ["business"] };
    expect(matchDomainRule(rule, "https://business.chase.com/")).toBe(false);
    expect(matchDomainRule(rule, "https://eu.business.chase.com/")).toBe(false);
    expect(matchDomainRule(rule, "https://secure.chase.com/")).toBe(true);
  });
  it("supports excludedSubdomains deeper than one level", () => {
    const rule = { domain: "chase.com", includeSubdomains: true, excludedSubdomains: ["eu.business"] };
    expect(matchDomainRule(rule, "https://eu.business.chase.com/")).toBe(false);
    expect(matchDomainRule(rule, "https://x.eu.business.chase.com/")).toBe(false);
    expect(matchDomainRule(rule, "https://business.chase.com/")).toBe(true);
  });
  it("accepts excludedSubdomains written as full hosts", () => {
    const rule = { domain: "chase.com", includeSubdomains: true, excludedSubdomains: ["business.chase.com"] };
    expect(matchDomainRule(rule, "https://business.chase.com/")).toBe(false);
  });
  it("matches hosts with ports and trailing dots", () => {
    expect(matchDomainRule({ domain: "chase.com" }, "https://chase.com.:443/login")).toBe(true);
  });
  it("never matches an empty domain", () => {
    expect(matchDomainRule({ domain: "" }, "https://chase.com/")).toBe(false);
  });
});

describe("matchUrlRule", () => {
  it("dispatches by rule kind", () => {
    expect(matchUrlRule("chase.com", "https://online.chase.com")).toBe(true);
    expect(matchUrlRule({ domain: "chase.com" }, "https://online.chase.com")).toBe(false);
  });
  it("never matches a missing url", () => {
    expect(matchUrlRule("chase.com", undefined)).toBe(false);
  });
});
