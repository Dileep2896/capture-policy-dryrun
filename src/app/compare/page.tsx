import type { Metadata } from "next";
import { CompareWorkspace } from "@/components/CompareWorkspace";
export const metadata: Metadata = { title: "Compare policies · Capture Policy Dry-Run" };
export default function Page() {
  return <CompareWorkspace />;
}
