import { z } from "zod";

/**
 * Capture filter fields of a workspace recording policy (camelCase JSON):
 * window/URL allow- and deny-lists, incognito skipping, schedules, meeting apps, redaction.
 */
export const REDACT_CATEGORIES = [
  "api_key",
  "email",
  "credit_card",
  "password_field",
  "phone",
  "financial_amount",
] as const;
export type RedactCategory = (typeof REDACT_CATEGORIES)[number];

export const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "expected HH:MM (24h)");

export const DomainRuleSchema = z.object({
  domain: z.string(),
  includeSubdomains: z.boolean().optional(),
  excludedSubdomains: z.array(z.string()).optional(),
});
export type DomainRule = z.infer<typeof DomainRuleSchema>;
export const UrlRuleSchema = z.union([z.string(), DomainRuleSchema]);
export type UrlRule = z.infer<typeof UrlRuleSchema>;

export const ScheduleSchema = z.object({
  dayOfWeek: z
    .string()
    .refine((d) => (DAYS as readonly string[]).includes(d.toLowerCase()), "expected a day name such as \"monday\""),
  startTime: time,
  endTime: time,
});
export type ScheduleWindow = z.infer<typeof ScheduleSchema>;

export const PolicySchema = z.object({
  ignoredWindows: z.array(z.string()).default([]),
  includedWindows: z.array(z.string()).default([]),
  ignoredUrls: z.array(UrlRuleSchema).default([]),
  includedUrls: z.array(UrlRuleSchema).default([]),
  ignoreIncognitoWindows: z.boolean().default(false),
  schedule: z.array(ScheduleSchema).default([]),
  ignoredMeetingApps: z.array(z.string()).default([]),
  redact: z.object({ categories: z.array(z.enum(REDACT_CATEGORIES)).default([]) }).default({ categories: [] }),
});
export type Policy = z.infer<typeof PolicySchema>;

export function emptyPolicy(): Policy {
  return PolicySchema.parse({});
}

export type Validation = {
  ok: boolean;
  /** Present when the shape parsed; may still be fail-closed. */
  policy?: Policy;
  errors: string[];
  /** True when a URL rule is invalid: the engine then drops all browser events. */
  failClosed: boolean;
};

/** Index-annotated errors for structured URL rules with an empty domain. */
export function urlRuleErrors(policy: Pick<Policy, "ignoredUrls" | "includedUrls">): string[] {
  const out: string[] = [];
  for (const key of ["ignoredUrls", "includedUrls"] as const) {
    policy[key].forEach((rule, i) => {
      if (typeof rule !== "string" && rule.domain.trim() === "") {
        out.push(`${key}[${i}].domain: must not be empty (fail closed: all browser events dropped)`);
      }
    });
  }
  return out;
}

export function validatePolicy(raw: unknown): Validation {
  const parsed = PolicySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`),
      failClosed: false,
    };
  }
  const errors = urlRuleErrors(parsed.data);
  return { ok: errors.length === 0, policy: parsed.data, errors, failClosed: errors.length > 0 };
}

export function parsePolicyJson(text: string): Validation {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (e) {
    return { ok: false, errors: [`Invalid JSON: ${(e as Error).message}`], failClosed: false };
  }
  return validatePolicy(raw);
}
