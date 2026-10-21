export type Sensitivity = "none" | "secret" | "personal" | "financial" | "credential";

/** One capture event, shaped like a typical local capture API's `/search` results. */
export type CaptureEvent = {
  id: string;
  type: "UI" | "OCR" | "Audio"; // mirrors /search content types
  timestamp: string; // ISO local time, e.g. 2026-10-20T09:15:00 (no offset)
  app_name: string;
  window_name: string;
  browser_url?: string;
  incognito?: boolean;
  text: string; // a11y text / OCR / transcript
  /** Ground truth label. Fixture-only: real captures never carry this. */
  sensitivity: Sensitivity;
  /** Exact sensitive substring. If present, redaction that removes it counts as protection. */
  sensitive_text?: string;
  note?: string; // why it's sensitive (shown in leak report)
};

export interface CaptureSource {
  listEvents(range: { start: string; end: string }): Promise<CaptureEvent[]>;
}
