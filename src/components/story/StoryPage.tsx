"use client";
import Link from "next/link";
import { motion, useReducedMotion, useScroll } from "framer-motion";
import { ArrowRight, GitCompare, ListChecks, ShieldAlert, FileText } from "lucide-react";
import { sampleDay } from "../../../fixtures/sample-day";
import { evaluatePolicy } from "@/lib/policy/evaluate";
import { leakReport } from "@/lib/policy/leaks";
import { presetById } from "@/lib/policy/presets";
import { Section, Reveal } from "./Section";
import { PolicyFlow } from "./PolicyFlow";
import { BeforeAfterDiagram } from "./BeforeAfterDiagram";
import { AnimatedMetric } from "./AnimatedMetric";

// Story numbers are computed from the real engine and fixtures, not hard-coded.
const leakyDecisions = evaluatePolicy(presetById("leaky").policy, sampleDay);
const hardDecisions = evaluatePolicy(presetById("hardened").policy, sampleDay);
const leaky = leakReport(leakyDecisions, sampleDay);
const hard = leakReport(hardDecisions, sampleDay);
const count = (k: string) => hardDecisions.filter((d) => d.decision === k).length;

// Failure modes users of popular screen-recording tools report publicly. Paraphrased, no product named.
const ISSUES = [
  { n: "report 01", title: "Incognito window was recorded despite the setting", tag: "privacy" },
  { n: "report 02", title: "Window filter bypassed under remote desktop", tag: "policy" },
  { n: "report 03", title: "Can't pre-exclude an app the tool hasn't seen yet", tag: "policy" },
];

const FEATURES = [
  {
    icon: ListChecks,
    title: "A decision for every event",
    body: "Captured, dropped or redacted, with the exact rule that decided it and the text that would actually be stored.",
  },
  {
    icon: ShieldAlert,
    title: "Leak report + privacy score",
    body: "Every sensitive trap the policy still lets through: password manager, incognito bank tab, API key in a terminal, HR call.",
  },
  {
    icon: GitCompare,
    title: "A/B policy compare",
    body: "Diff two drafts event by event to see which leaks a rule change fixes and which it introduces.",
  },
  {
    icon: FileText,
    title: "Exportable privacy review",
    body: "One click turns the run into a Markdown report a security team can read, check and sign off.",
  },
];

export function StoryPage() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  return (
    <main className="grain relative overflow-x-hidden">
      {!reduce && (
        <motion.div aria-hidden className="fixed left-0 top-0 z-40 h-0.5 w-full origin-left bg-accent" style={{ scaleX: scrollYProgress }} />
      )}

      <Section id="company" eyebrow="01 · the domain">
        <Reveal as="h1" className="max-w-4xl font-display text-4xl leading-[1.05] tracking-tight sm:text-6xl">
          Screen-recording AI tools turn everyday computer work into memory for AI agents.
        </Reveal>
        <Reveal as="p" className="max-w-2xl text-xl text-muted">
          They record what people see, hear and do, keep it on the device, and hand agents that history so they can map
          workflows and automate them. The more they capture, the more a single bad rule can expose.
        </Reveal>
        <Reveal>
          <PolicyFlow />
        </Reveal>
        <Reveal as="p" className="font-mono text-sm text-muted">
          an independent open-source project · local-first · no network calls
        </Reveal>
      </Section>

      <Section id="pain" eyebrow="02 · the pain point">
        <Reveal as="h2" className="max-w-3xl font-display text-4xl tracking-tight sm:text-5xl">
          <span id="pain-title">Teams hit a privacy wall.</span>
        </Reveal>
        <Reveal as="p" className="max-w-2xl text-xl text-muted">
          Before an enterprise rollout, security asks one question: what exactly will this record on our people&apos;s
          machines? Capture policies exist, but nobody can test one before it ships, and users of popular tools in this space
          report them leaking.
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-3">
          {ISSUES.map((i) => (
            <Reveal key={i.n} className="rounded-lg border border-signal/30 bg-signal/5 p-4">
              <p className="font-mono text-xs text-signal">
                {i.n} · {i.tag}
              </p>
              <p className="mt-2 font-display text-lg leading-snug">{i.title}</p>
            </Reveal>
          ))}
        </div>
        <Reveal as="blockquote" className="max-w-3xl border-l-2 border-paper/40 pl-4 text-2xl italic">
          &ldquo;Even local-only storage triggers a brutal compliance conversation.&rdquo;
          <span className="mt-1 block font-mono text-xs not-italic text-muted">a developer discussing team rollouts</span>
        </Reveal>
      </Section>

      <Section id="decision" eyebrow="03 · the decision">
        <Reveal as="h2" className="max-w-3xl font-display text-4xl tracking-tight sm:text-5xl">
          <span id="decision-title">Why this feature: two options, one unblocks rollouts.</span>
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          <Reveal className="rounded-lg border hairline p-6 opacity-50">
            <p className="font-mono text-xs text-muted">option b · not built</p>
            <p className="mt-2 font-display text-2xl line-through decoration-muted">Silent-gap detector</p>
            <p className="mt-2 text-muted">Capture stalls are native capture-engine bugs. A web tool could only visualize the symptoms.</p>
          </Reveal>
          <Reveal className="rounded-lg border border-accent/60 bg-accent/5 p-6 shadow-[0_0_60px_-20px_rgb(var(--accent)/0.5)]">
            <p className="font-mono text-xs text-accent">option a · built</p>
            <p className="mt-2 font-display text-2xl">Capture policy dry-run</p>
            <p className="mt-2 text-paper/80">
              Answers the question that blocks team rollouts, is fully verifiable with tests, and uses a realistic
              capture-config shape (window, URL, incognito, schedule and redaction rules) so it maps onto real tools.
            </p>
          </Reveal>
        </div>
      </Section>

      <Section id="what" eyebrow="04 · what it does">
        <Reveal as="h2" className="max-w-3xl font-display text-4xl tracking-tight sm:text-5xl">
          <span id="what-title">Run a draft policy against a realistic day of capture.</span>
        </Reveal>
        <Reveal as="p" className="max-w-2xl text-xl text-muted">
          {sampleDay.length} fictional capture events (screen frames, accessibility text and audio) from an ops
          analyst&apos;s Tuesday, seeded with {leaky.sensitiveEvents} sensitive traps.
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <Reveal key={title} className="rounded-lg border hairline bg-surface/60 p-5">
              <Icon size={20} aria-hidden className="text-accent" />
              <p className="mt-3 font-display text-xl">{title}</p>
              <p className="mt-1 text-muted">{body}</p>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section id="how" eyebrow="05 · before → after">
        <Reveal as="h2" className="max-w-3xl font-display text-4xl tracking-tight sm:text-5xl">
          <span id="how-title">Test the policy on a sample day, not on 200 laptops.</span>
        </Reveal>
        <Reveal className="rounded-xl border hairline bg-ink/70 p-2 sm:p-6">
          <BeforeAfterDiagram events={sampleDay.length} captured={count("captured")} redacted={count("redacted")} dropped={count("dropped")} />
        </Reveal>
        <Reveal as="p" className="max-w-2xl text-lg text-muted">
          Every event gets a decision and the exact rule behind it: <code className="font-mono text-sm text-paper">ignoredUrls[2]: chase.com (includeSubdomains)</code>.
          Incognito, subdomain exclusions, schedules, meeting apps and redaction are all modelled, and malformed URL rules
          fail closed: the engine drops every browser event rather than guess.
        </Reveal>
      </Section>

      <Section id="impact" eyebrow="06 · measured impact">
        <Reveal as="h2" className="max-w-3xl font-display text-4xl tracking-tight sm:text-5xl">
          <span id="impact-title">From a plausible draft to zero leaks, before anything records.</span>
        </Reveal>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Reveal className="rounded-lg border border-accent/40 p-5 sm:col-span-2">
            <p className="font-mono text-xs text-muted">privacy score, draft → hardened</p>
            <p className="font-display text-7xl tabular-nums tracking-tight sm:text-8xl">
              <AnimatedMetric testId="story-score" from={Math.round(leaky.score * 100)} to={Math.round(hard.score * 100)} suffix="%" />
            </p>
          </Reveal>
          <Reveal className="rounded-lg border hairline p-5">
            <p className="font-mono text-xs text-muted">leaks stored</p>
            <p className="font-display text-6xl tabular-nums">
              <AnimatedMetric from={leaky.leaks.length} to={hard.leaks.length} />
            </p>
          </Reveal>
          <Reveal className="rounded-lg border hairline p-5">
            <p className="font-mono text-xs text-muted">sensitive traps tested</p>
            <p className="font-display text-6xl tabular-nums">
              <AnimatedMetric from={0} to={leaky.sensitiveEvents} />
            </p>
          </Reveal>
          <Reveal className="rounded-lg border hairline p-5 sm:col-span-2 lg:col-span-4">
            <p className="font-mono text-xs text-muted">security review</p>
            <p className="font-display text-3xl">days of back-and-forth → one exported report</p>
          </Reveal>
        </div>
        <Reveal as="p" className="font-mono text-xs text-muted">
          Illustrative, demo-based estimates: scores come from the fictional sample day in this repo, not customer data.
        </Reveal>
      </Section>

      <Section id="cta" eyebrow="07 · try it">
        <Reveal as="h2" className="font-display text-4xl tracking-tight sm:text-5xl">
          <span id="cta-title">See what your policy would record.</span>
        </Reveal>
        <Reveal className="flex flex-wrap gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-md bg-paper px-5 py-3 font-display text-ink transition hover:bg-accent">
            Try the dry-run <ArrowRight size={18} aria-hidden />
          </Link>
          <Link href="/compare" className="inline-flex items-center gap-2 rounded-md border border-paper/40 px-5 py-3 font-display transition hover:border-paper">
            Compare policies <GitCompare size={18} aria-hidden />
          </Link>
        </Reveal>
      </Section>
    </main>
  );
}
