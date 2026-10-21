"use client";
import { useMemo, useRef } from "react";
import { parsePolicyJson, emptyPolicy, type Policy, type Validation } from "./policy/schema";

/** Parses editor text; keeps evaluating the last valid policy while the text is broken. */
export function usePolicy(text: string): { validation: Validation; policy: Policy; stale: boolean } {
  const lastGood = useRef<Policy>(emptyPolicy());
  return useMemo(() => {
    const validation = parsePolicyJson(text);
    if (validation.policy) lastGood.current = validation.policy;
    return { validation, policy: validation.policy ?? lastGood.current, stale: !validation.policy };
  }, [text]);
}
