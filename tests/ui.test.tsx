import { render, screen, fireEvent, within, act } from "@testing-library/react";
import { DryRunWorkspace } from "@/components/DryRunWorkspace";
import { CompareWorkspace } from "@/components/CompareWorkspace";
import { StoryPage } from "@/components/story/StoryPage";
import { useDryRunStore } from "@/lib/store";
import { makeReportBlob } from "@/lib/export";
import { presetById } from "@/lib/policy/presets";
import { sampleDay } from "@fixtures/sample-day";

beforeEach(() => {
  useDryRunStore.getState().reset();
});

const readBlob = (b: Blob) =>
  new Promise<string>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.readAsText(b);
  });

describe("DryRunWorkspace", () => {
  it("renders one row per sample event", () => {
    render(<DryRunWorkspace />);
    expect(screen.getAllByTestId("event-row")).toHaveLength(sampleDay.length);
  });

  it("shows a zod error on bad JSON and does not crash", () => {
    render(<DryRunWorkspace />);
    const editor = screen.getByLabelText(/capture policy json/i);
    fireEvent.change(editor, { target: { value: '{"ignoredWindows": "1Password"}' } });
    expect(screen.getByRole("alert")).toHaveTextContent(/ignoredWindows/);
    fireEvent.change(editor, { target: { value: "{ nope" } });
    expect(screen.getByRole("alert")).toHaveTextContent(/Invalid JSON/);
    expect(screen.getAllByTestId("event-row")).toHaveLength(sampleDay.length);
  });

  it("switching presets updates the leak count", () => {
    render(<DryRunWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: /draft enterprise/i }));
    expect(screen.getByTestId("leak-count")).toHaveTextContent("5");
    fireEvent.click(screen.getByRole("button", { name: /hardened enterprise/i }));
    expect(screen.getByTestId("leak-count")).toHaveTextContent("0");
    expect(screen.getByTestId("privacy-score")).toHaveTextContent("100%");
  });

  it("shows matched rules for a selected event", () => {
    render(<DryRunWorkspace />);
    fireEvent.click(screen.getByRole("button", { name: /hardened enterprise/i }));
    const row = screen.getAllByTestId("event-row").find((r) => r.textContent?.includes("online.chase.com"))!;
    fireEvent.click(row);
    const detail = screen.getByTestId("event-detail");
    expect(within(detail).getByText(/chase\.com \(includeSubdomains; excluding business\)/)).toBeInTheDocument();
  });

  it("export button produces a Markdown blob", async () => {
    const blobs: Blob[] = [];
    const orig = URL.createObjectURL;
    URL.createObjectURL = ((b: Blob) => {
      blobs.push(b);
      return "blob:test";
    }) as typeof URL.createObjectURL;
    URL.revokeObjectURL = () => {};
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    render(<DryRunWorkspace />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /export review/i }));
    });
    expect(blobs).toHaveLength(1);
    expect(await readBlob(blobs[0])).toContain("# Privacy review");
    expect(click).toHaveBeenCalledOnce();
    click.mockRestore();
    URL.createObjectURL = orig;
  });
});

describe("makeReportBlob", () => {
  it("contains the policy and stats", async () => {
    const b = makeReportBlob(presetById("hardened").policy, "Hardened enterprise", "2026-10-21T00:00:00Z");
    const text = await readBlob(b);
    expect(b.type).toBe("text/markdown");
    expect(text).toContain("| Privacy score | 100% |");
  });
});

describe("CompareWorkspace", () => {
  it("shows leaks fixed between the leaky and hardened presets", () => {
    render(<CompareWorkspace />);
    expect(screen.getByTestId("count-leaksFixed")).toHaveTextContent("5");
    expect(screen.getAllByTestId("changed-row").length).toBeGreaterThan(0);
  });
});

describe("StoryPage", () => {
  it("renders every section and CTA", () => {
    render(<StoryPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/memory for AI agents/i);
    expect(screen.getByText(/privacy wall/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /try the dry-run/i })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /compare policies/i })).toHaveAttribute("href", "/compare");
  });
});
