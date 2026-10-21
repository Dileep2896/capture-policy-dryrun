"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/", label: "Dry-run" },
  { href: "/compare", label: "Compare" },
  { href: "/story", label: "Story" },
];

export function Nav() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b hairline bg-ink/85 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-sm tracking-tight">
          <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-accent" />
          Capture Policy <span className="text-muted">Dry-Run</span>
        </Link>
        <ul className="flex gap-1 font-display text-sm">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={path === l.href ? "page" : undefined}
                className={cn(
                  "rounded px-2.5 py-1 transition-colors hover:text-paper",
                  path === l.href ? "bg-paper text-ink" : "text-muted",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
