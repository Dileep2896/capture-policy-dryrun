import type { RedactCategory } from "./schema";

export type Span = { start: number; end: number; category: RedactCategory };

export function luhnValid(digits: string): boolean {
  const d = digits.replace(/\D/g, "");
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

type Detector = { re: RegExp; accept?: (m: string) => boolean };

/** Regex stand-ins for an on-device PII model. */
const DETECTORS: Record<RedactCategory, Detector> = {
  api_key: { re: /\b(?:sk-[A-Za-z0-9_-]{16,}|AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{20,})/g },
  email: { re: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+\b/g },
  credit_card: { re: /\b\d(?:[ -]?\d){12,18}\b/g, accept: luhnValid },
  password_field: { re: /\[AXSecureTextField\][^\n]*/g },
  phone: { re: /(?:\+\d{1,2}[ .-]?)?(?:\(\d{3}\)|\b\d{3})[ .-]?\d{3}[ .-]\d{4}\b/g },
  financial_amount: { re: /\$\s?\d{1,3}(?:,\d{3})+(?:\.\d{2})?|\$\s?\d+(?:\.\d{2})?\b/g },
};

export function findSpans(text: string, categories: readonly RedactCategory[]): Span[] {
  const all: Span[] = [];
  for (const category of categories) {
    const { re, accept } = DETECTORS[category];
    for (const m of text.matchAll(new RegExp(re.source, re.flags))) {
      if (accept && !accept(m[0])) continue;
      all.push({ start: m.index!, end: m.index! + m[0].length, category });
    }
  }
  // Longest-first at equal starts, then drop overlaps.
  all.sort((a, b) => a.start - b.start || b.end - a.end);
  const out: Span[] = [];
  for (const s of all) {
    const last = out[out.length - 1];
    if (last && s.start < last.end) continue;
    out.push(s);
  }
  return out;
}

export function redactText(text: string, categories: readonly RedactCategory[]): { text: string; spans: Span[] } {
  const spans = findSpans(text, categories);
  let out = "";
  let cursor = 0;
  for (const s of spans) {
    out += text.slice(cursor, s.start) + `[REDACTED:${s.category}]`;
    cursor = s.end;
  }
  out += text.slice(cursor);
  return { text: out, spans };
}
