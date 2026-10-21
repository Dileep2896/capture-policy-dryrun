import type { CaptureEvent, CaptureSource } from "./types";

export class NotConfigured extends Error {
  constructor() {
    super("LocalApiCaptureSource is a stub: the demo never calls a local capture API.");
    this.name = "NotConfigured";
  }
}

/**
 * How this would be wired to a real local capture service (never used in the demo):
 *
 *   GET ${CAPTURE_API_URL}/search?content_type=all&start_time=<start>&end_time=<end>&limit=1000
 *
 * Each result `{ type: "OCR" | "UI" | "Audio", content }` maps to a CaptureEvent:
 *   content.app_name -> app_name, content.window_name -> window_name,
 *   content.browser_url -> browser_url, content.text | content.transcription -> text,
 *   content.timestamp -> timestamp. `sensitivity` would come from a reviewer's labels.
 */
export class LocalApiCaptureSource implements CaptureSource {
  constructor(readonly baseUrl = process.env.CAPTURE_API_URL ?? "http://localhost:8080") {}
  async listEvents(_range: { start: string; end: string }): Promise<CaptureEvent[]> {
    throw new NotConfigured();
  }
}
