/** Shared motion tokens (ecc motion-foundations style). */
export const motionTokens = {
  duration: { fast: 0.18, normal: 0.32, slow: 0.6, story: 1.6 },
  easing: { smooth: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  distance: { sm: 8, md: 16, lg: 32 },
  stagger: 0.075,
} as const;

export const springs = {
  gentle: { type: "spring", stiffness: 180, damping: 24 },
  snappy: { type: "spring", stiffness: 420, damping: 30 },
} as const;
