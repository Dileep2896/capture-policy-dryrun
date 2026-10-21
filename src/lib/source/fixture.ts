import type { CaptureEvent, CaptureSource } from "./types";
import { sampleDay } from "../../../fixtures/sample-day";

/** Default source: the fictional "Northstar Operations" sample day. */
export class FixtureCaptureSource implements CaptureSource {
  constructor(private readonly events: readonly CaptureEvent[] = sampleDay) {}
  async listEvents(range: { start: string; end: string }): Promise<CaptureEvent[]> {
    return this.events.filter((e) => e.timestamp >= range.start && e.timestamp <= range.end);
  }
}
