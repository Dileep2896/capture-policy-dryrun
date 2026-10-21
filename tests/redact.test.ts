import { redactText, luhnValid } from "@/lib/policy/redact";

describe("redactText", () => {
  it("redacts api keys", () => {
    const r = redactText("key sk-proj-AbC123_def-456ghij789 here", ["api_key"]);
    expect(r.text).toBe("key [REDACTED:api_key] here");
    expect(r.spans).toEqual([{ start: 4, end: 33, category: "api_key" }]);
  });
  it("redacts emails", () => {
    expect(redactText("ping jordan@northstar-ops.example now", ["email"]).text).toBe("ping [REDACTED:email] now");
  });
  it("redacts Luhn-valid card numbers only", () => {
    expect(redactText("card 4242 4242 4242 4242", ["credit_card"]).text).toBe("card [REDACTED:credit_card]");
    expect(redactText("order 1234 5678 9012 3456", ["credit_card"]).spans).toHaveLength(0);
  });
  it("redacts password fields from the a11y role", () => {
    const r = redactText("Email: a\n[AXSecureTextField] Password: hunter2-demo\nSave", ["password_field"]);
    expect(r.text).toBe("Email: a\n[REDACTED:password_field]\nSave");
  });
  it("redacts phone numbers", () => {
    expect(redactText("call (415) 555-0134 today", ["phone"]).text).toBe("call [REDACTED:phone] today");
    expect(redactText("call +1 415-555-0134", ["phone"]).text).toBe("call [REDACTED:phone]");
  });
  it("redacts financial amounts", () => {
    expect(redactText("Total due $4,900.00 net 30", ["financial_amount"]).text).toBe("Total due [REDACTED:financial_amount] net 30");
  });
  it("does not treat $ in code as an amount", () => {
    expect(redactText("const s = `${total}`; echo $HOME", ["financial_amount"]).spans).toHaveLength(0);
  });
  it("only applies requested categories", () => {
    expect(redactText("a@b.example sk-proj-AbC123_def-456ghij789", ["email"]).text).toBe(
      "[REDACTED:email] sk-proj-AbC123_def-456ghij789",
    );
  });
  it("returns sorted, non-overlapping spans across categories", () => {
    const r = redactText("x@y.example paid $10.00", ["financial_amount", "email"]);
    expect(r.spans.map((s) => s.category)).toEqual(["email", "financial_amount"]);
    expect(r.text).toBe("[REDACTED:email] paid [REDACTED:financial_amount]");
  });
  it("is a no-op with no categories", () => {
    expect(redactText("a@b.example", [])).toEqual({ text: "a@b.example", spans: [] });
  });
});

describe("luhnValid", () => {
  it("validates", () => {
    expect(luhnValid("4242424242424242")).toBe(true);
    expect(luhnValid("4242424242424241")).toBe(false);
  });
});
