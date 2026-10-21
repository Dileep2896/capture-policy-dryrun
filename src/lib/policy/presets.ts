import type { Policy } from "./schema";
import { emptyPolicy } from "./schema";

export type Preset = { id: "consumer" | "leaky" | "hardened"; name: string; blurb: string; policy: Policy };

const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"].map((dayOfWeek) => ({
  dayOfWeek,
  startTime: "08:00",
  endTime: "18:00",
}));

export const PRESETS: Preset[] = [
  {
    id: "consumer",
    name: "Default consumer",
    blurb: "What a personal install ships with: skip password managers and incognito.",
    policy: {
      ...emptyPolicy(),
      ignoredWindows: ["1Password", "Bitwarden", "Keychain Access"],
      ignoreIncognitoWindows: true,
      redact: { categories: ["api_key", "credit_card", "password_field"] },
    },
  },
  {
    id: "leaky",
    name: "Draft enterprise (leaky)",
    blurb: "A plausible first draft. Looks strict, still stores personal banking, personal Gmail, payroll and contract amounts.",
    policy: {
      ...emptyPolicy(),
      ignoredWindows: ["1Password", "WhatsApp"],
      ignoredUrls: ["reddit.com", { domain: "chase.com" }],
      ignoreIncognitoWindows: true,
      schedule: weekdays,
      ignoredMeetingApps: ["Microsoft Teams"],
      redact: { categories: ["api_key", "email", "credit_card", "password_field"] },
    },
  },
  {
    id: "hardened",
    name: "Hardened enterprise",
    blurb: "Work hours only, subdomain-aware URL rules, HR meetings off, every redactor on.",
    policy: {
      ...emptyPolicy(),
      ignoredWindows: ["1Password", "WhatsApp", "@gmail.com", "payroll"],
      ignoredUrls: [
        "reddit.com",
        "wellsfargo.com",
        { domain: "chase.com", includeSubdomains: true, excludedSubdomains: ["business"] },
      ],
      ignoreIncognitoWindows: true,
      schedule: weekdays,
      ignoredMeetingApps: ["Microsoft Teams"],
      redact: {
        categories: ["api_key", "email", "credit_card", "password_field", "phone", "financial_amount"],
      },
    },
  },
];

export const presetById = (id: Preset["id"]) => PRESETS.find((p) => p.id === id)!;
