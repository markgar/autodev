import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Toaster } from "sonner";

// Mock shadcn/ui components that depend on missing Radix packages
vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) =>
    asChild ? <>{children}</> : <div>{children}</div>,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button onClick={() => {}}>{children}</button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => <button onClick={onClick}>{children}</button>,
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({
    children,
    open,
    onOpenChange,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import { SampleSpecsAdminPage } from "./SampleSpecsAdminPage.js";

vi.mock("@/lib/api", () => ({
  fetchSampleSpecs: vi.fn(),
  fetchSampleSpecContent: vi.fn(),
  uploadSampleSpec: vi.fn(),
  deleteSampleSpec: vi.fn(),
  formatDate: vi.fn(() => "2 days ago"),
}));

vi.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.filter(Boolean).join(" "),
  formatFileSize: vi.fn((size: number) => `${size} B`),
}));

import {
  fetchSampleSpecs,
  fetchSampleSpecContent,
  uploadSampleSpec,
  deleteSampleSpec,
} from "@/lib/api";

const sampleSpec = {
  name: "minimal.md",
  size: 1024,
  lastModified: "2024-06-01T00:00:00.000Z",
};

function renderPage() {
  return render(
    <>
      <Toaster />
      <SampleSpecsAdminPage />
    </>
  );
}

describe("SampleSpecsAdminPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Sample Specs heading", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Sample Specs" })).toBeTruthy()
    );
  });

  it("shows loading skeleton while specs are fetching", () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(document.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("shows empty state message when no specs exist", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(
        screen.getByText(/No sample specs uploaded yet/)
      ).toBeTruthy()
    );
  });

  it("renders spec filename in the list after loading", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([sampleSpec]);
    renderPage();
    await waitFor(() =>
      expect(screen.getAllByText("minimal.md").length).toBeGreaterThan(0)
    );
  });

  it("renders Upload button", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /Upload/i })).toBeTruthy()
    );
  });

  it("shows 'Failed to load specs' paragraph on fetch error", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Blob storage unavailable")
    );
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Failed to load specs")).toBeTruthy()
    );
  });

  it("shows Retry button on fetch error", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Error"));
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy()
    );
  });

  it("retries fetch when Retry button is clicked", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error("first failure"))
      .mockResolvedValue([]);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: "Retry" }));
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() =>
      expect(fetchSampleSpecs).toHaveBeenCalledTimes(2)
    );
  });

  it("renders multiple specs", async () => {
    const second = { name: "full.md", size: 2048, lastModified: "2024-06-02T00:00:00.000Z" };
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([sampleSpec, second]);
    renderPage();
    await waitFor(() => {
      expect(screen.getAllByText("minimal.md").length).toBeGreaterThan(0);
      expect(screen.getAllByText("full.md").length).toBeGreaterThan(0);
    });
  });

  it("opens view modal with spec content when eye button is clicked", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([sampleSpec]);
    (fetchSampleSpecContent as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: "minimal.md",
      content: "# Minimal Spec\nSome content here.",
    });
    renderPage();
    const viewButtons = await screen.findAllByRole("button", { name: /View minimal.md/i });
    fireEvent.click(viewButtons[0]);
    await waitFor(() =>
      expect(screen.getByText(/Minimal Spec/)).toBeTruthy()
    );
  });

  it("view modal shows Download and Close buttons", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([sampleSpec]);
    (fetchSampleSpecContent as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: "minimal.md",
      content: "# Content",
    });
    renderPage();
    const viewButtons = await screen.findAllByRole("button", { name: /View minimal.md/i });
    fireEvent.click(viewButtons[0]);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Download" })).toBeTruthy();
      expect(screen.getByRole("button", { name: "Close" })).toBeTruthy();
    });
  });

  it("closes view modal when Close button is clicked", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([sampleSpec]);
    (fetchSampleSpecContent as ReturnType<typeof vi.fn>).mockResolvedValue({
      name: "minimal.md",
      content: "# Content",
    });
    renderPage();
    const viewButtons = await screen.findAllByRole("button", { name: /View minimal.md/i });
    fireEvent.click(viewButtons[0]);
    await waitFor(() => screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Download" })).toBeNull()
    );
  });

  it("shows delete confirmation dialog with correct description text", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([sampleSpec]);
    renderPage();
    await screen.findAllByRole("button", { name: /Delete minimal.md/i });
    await waitFor(() => {
      const matches = screen.getAllByText(/Delete minimal\.md\? This cannot be undone\./);
      expect(matches.length).toBeGreaterThan(0);
    });
  });

  it("calls deleteSampleSpec and reloads specs when delete is confirmed", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([sampleSpec]);
    (deleteSampleSpec as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
    renderPage();
    await waitFor(() => screen.getAllByText(/This cannot be undone/));
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    fireEvent.click(deleteButtons[0]);
    await waitFor(() =>
      expect(deleteSampleSpec).toHaveBeenCalledWith("minimal.md")
    );
    await waitFor(() =>
      expect(fetchSampleSpecs).toHaveBeenCalledTimes(2)
    );
  });

  it("calls uploadSampleSpec and reloads specs after file is selected", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (uploadSampleSpec as ReturnType<typeof vi.fn>).mockResolvedValue({ name: "new.md" });
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /Upload/i }));
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["# New Spec"], "new.md", { type: "text/markdown" });
    Object.defineProperty(fileInput, "files", { value: [file], configurable: true });
    fireEvent.change(fileInput);
    await waitFor(() =>
      expect(uploadSampleSpec).toHaveBeenCalledWith(file)
    );
    await waitFor(() =>
      expect(fetchSampleSpecs).toHaveBeenCalledTimes(2)
    );
  });
});
