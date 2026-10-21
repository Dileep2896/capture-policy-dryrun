"use client";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "@/lib/motion-tokens";

type Lane = { id: string; label: string; y: number; color: string; count: number };

function Node({ x, y, w, label, sub, accent }: { x: number; y: number; w: number; label: string; sub?: string; accent?: boolean }) {
  return (
    <g>
      <rect
        x={x}
        y={y - 22}
        width={w}
        height={44}
        rx={8}
        fill="rgb(var(--surface))"
        stroke={accent ? "rgb(var(--accent))" : "rgb(var(--paper) / 0.3)"}
      />
      <text x={x + w / 2} y={sub ? y - 2 : y + 4} textAnchor="middle" fill="rgb(var(--paper))" fontSize="13" fontFamily="var(--font-display)">
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + 14} textAnchor="middle" fill="rgb(var(--muted))" fontSize="10" fontFamily="var(--font-mono)">
          {sub}
        </text>
      )}
    </g>
  );
}

/** Before: ship and hope. After: dry-run fans events into decision lanes, then a leak report. */
export function BeforeAfterDiagram({ captured, redacted, dropped, events }: { captured: number; redacted: number; dropped: number; events: number }) {
  const reduce = useReducedMotion();
  const draw = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0 },
          whileInView: { pathLength: 1 },
          viewport: { once: true },
          transition: { duration: motionTokens.duration.slow * 1.5, delay, ease: motionTokens.easing.smooth },
        };
  const lanes: Lane[] = [
    { id: "cap", label: `captured ${captured}`, y: 250, color: "rgb(var(--paper))", count: 4 },
    { id: "red", label: `redacted ${redacted}`, y: 310, color: "rgb(var(--paper) / 0.6)", count: 2 },
    { id: "drop", label: `dropped ${dropped}`, y: 370, color: "rgb(var(--muted) / 0.7)", count: 3 },
  ];
  const lanePath = (y: number) => `M 330 310 C 400 310, 400 ${y}, 470 ${y} L 610 ${y} C 660 ${y}, 660 310, 700 310`;

  return (
    <svg viewBox="0 0 1000 420" className="w-full" role="img" aria-labelledby="ba-title">
      <title id="ba-title">Before: policy shipped to 200 devices with unknown results. After: dry-run on a sample day, decisions per event, a leak report, approved rollout.</title>
      {/* BEFORE */}
      <text x={20} y={40} fill="rgb(var(--muted))" fontSize="12" fontFamily="var(--font-mono)">BEFORE</text>
      <motion.path d="M 170 90 L 830 90" stroke="rgb(var(--paper) / 0.25)" strokeDasharray="4 6" fill="none" {...draw(0)} />
      <Node x={20} y={90} w={150} label="Policy JSON" />
      <Node x={260} y={90} w={180} label="Ship to 200 devices" />
      <Node x={530} y={90} w={90} label="???" />
      <Node x={710} y={90} w={250} label="Security review stalls" sub="weeks of questions" />

      {/* AFTER */}
      <text x={20} y={200} fill="rgb(var(--muted))" fontSize="12" fontFamily="var(--font-mono)">AFTER</text>
      <motion.path d="M 170 310 L 180 310" stroke="rgb(var(--paper) / 0.4)" fill="none" {...draw(0.2)} />
      <Node x={20} y={310} w={150} label="Policy JSON" />
      <Node x={180} y={310} w={150} label="Dry-run" sub={`${events} sample events`} accent />
      {lanes.map((l, i) => (
        <g key={l.id}>
          <motion.path id={`lane-${l.id}`} d={lanePath(l.y)} stroke="rgb(var(--paper) / 0.18)" fill="none" {...draw(0.4 + i * 0.1)} />
          <text x={540} y={l.y - 8} textAnchor="middle" fill={l.color} fontSize="11" fontFamily="var(--font-mono)">
            {l.label}
          </text>
          {!reduce &&
            Array.from({ length: l.count }, (_, k) => (
              <circle key={k} r={4} fill={l.color}>
                <animateMotion dur="3.2s" repeatCount="indefinite" begin={`${1 + i * 0.35 + k * (3.2 / l.count)}s`}>
                  <mpath href={`#lane-${l.id}`} />
                </animateMotion>
              </circle>
            ))}
        </g>
      ))}
      <motion.path d="M 860 310 L 880 310" stroke="rgb(var(--paper) / 0.4)" fill="none" {...draw(0.8)} />
      <Node x={700} y={310} w={160} label="Leak report" sub="score + evidence" />
      <Node x={880} y={310} w={110} label="Approved" sub="rollout" accent />
      {!reduce && (
        <motion.circle
          cx={255}
          cy={310}
          r={30}
          fill="none"
          stroke="rgb(var(--accent))"
          initial={{ opacity: 0.6, scale: 0.9 }}
          animate={{ opacity: [0.6, 0, 0.6], scale: [0.9, 1.6, 0.9] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          style={{ transformOrigin: "255px 310px" }}
        />
      )}
    </svg>
  );
}
