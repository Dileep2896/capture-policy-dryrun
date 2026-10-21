import type { DomainRule, UrlRule } from "./schema";

/** Lowercased hostname without scheme, port, path, trailing dot or leading `www.`. */
export function normalizeHost(input: string | undefined | null): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
  let host: string;
  try {
    host = new URL(withScheme).hostname;
  } catch {
    return null;
  }
  host = host.toLowerCase().replace(/\.+$/, "");
  if (host.startsWith("www.")) host = host.slice(4);
  return host || null;
}

function isSelfOrDescendant(host: string, domain: string): boolean {
  return host === domain || host.endsWith(`.${domain}`);
}

/** Legacy string rule: matches the domain and all of its subdomains. */
export function matchLegacyUrl(rule: string, url: string | undefined): boolean {
  const host = normalizeHost(url);
  const domain = normalizeHost(rule);
  if (!host || !domain) return false;
  return isSelfOrDescendant(host, domain);
}

/**
 * Structured rule: exact domain always; descendants only with includeSubdomains;
 * never descendants rooted at an excluded subdomain.
 */
export function matchDomainRule(rule: DomainRule, url: string | undefined): boolean {
  const host = normalizeHost(url);
  const domain = normalizeHost(rule.domain);
  if (!host || !domain) return false;
  if (host === domain) return true;
  if (!rule.includeSubdomains || !host.endsWith(`.${domain}`)) return false;
  for (const raw of rule.excludedSubdomains ?? []) {
    let sub = raw.trim().toLowerCase().replace(/\.+$/, "");
    if (sub.endsWith(`.${domain}`)) sub = sub.slice(0, -(domain.length + 1));
    if (!sub) continue;
    if (isSelfOrDescendant(host, `${sub}.${domain}`)) return false;
  }
  return true;
}

export function matchUrlRule(rule: UrlRule, url: string | undefined): boolean {
  return typeof rule === "string" ? matchLegacyUrl(rule, url) : matchDomainRule(rule, url);
}

export function describeUrlRule(rule: UrlRule): string {
  if (typeof rule === "string") return `${rule} (legacy, + subdomains)`;
  const parts: string[] = [];
  if (rule.includeSubdomains) parts.push("includeSubdomains");
  if (rule.excludedSubdomains?.length) parts.push(`excluding ${rule.excludedSubdomains.join(", ")}`);
  return parts.length ? `${rule.domain} (${parts.join("; ")})` : `${rule.domain} (exact)`;
}
