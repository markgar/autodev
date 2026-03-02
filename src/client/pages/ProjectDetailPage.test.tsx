import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProjectDetailPage } from "./ProjectDetailPage.js";

vi.mock("@/lib/api", () => ({
  fetchProject: vi.fn(),
  fetchProjectLogs: vi.fn(),
  formatDate: vi.fn(() => "3 hours ago"),
}));

import { fetchProject, fetchProjectLogs } from "@/lib/api";

const sampleProject = {
  id: "proj-abc",
  organizationId: "default",
  type: "project" as const,
  name: "My Test App",
  specName: "minimal.md",
  createdAt: "2024-06-01T10:00:00.000Z",
  latestRunStatus: null,
  runCount: 0,
};

function renderPage(id = "proj-abc") {
  return render(
    <MemoryRouter initialEntries={[`/projects/${id}`]}>
      <Routes>
        <Route path="/" element={<div data-testid="dashboard" />} />
        <Route path="/projects/:id" element={<ProjectDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProjectDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading spinner while project is fetching", () => {
    (fetchProject as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    expect(screen.getByRole("status", { name: "Loading" })).toBeTruthy();
  });

  it("renders project name as h1 heading after successful load", async () => {
    (fetchProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1, name: "My Test App" })).toBeTruthy()
    );
  });

  it("renders Back to Dashboard link", async () => {
    (fetchProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/Back to Dashboard/)).toBeTruthy()
    );
  });

  it("renders formatted created date below heading", async () => {
    (fetchProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByText("3 hours ago")).toBeTruthy());
  });

  it("shows 'Project not found' when API returns 404 error", async () => {
    const err = Object.assign(new Error("Project not found"), { status: 404 });
    (fetchProject as ReturnType<typeof vi.fn>).mockRejectedValue(err);
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByText("Project not found")).toBeTruthy());
  });

  it("shows error message and Retry button when project fetch fails with non-404", async () => {
    (fetchProject as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network failure"));
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Network failure")).toBeTruthy();
      expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    });
  });

  it("retries project fetch when Retry button is clicked", async () => {
    (fetchProject as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error("Temporary failure"))
      .mockResolvedValue(sampleProject);
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: "Retry" }));
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { level: 1, name: "My Test App" })).toBeTruthy()
    );
  });

  it("shows 'Loading logs' spinner while logs are fetching", async () => {
    (fetchProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderPage();
    await waitFor(() => screen.getByRole("heading", { level: 1, name: "My Test App" }));
    expect(screen.getByText(/Loading logs/)).toBeTruthy();
  });

  it("shows empty state message when logs array is empty", async () => {
    (fetchProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/No logs yet/)).toBeTruthy()
    );
  });

  it("renders log lines when logs are available", async () => {
    (fetchProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue(["Building...", "Done!"]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("Building...")).toBeTruthy();
      expect(screen.getByText("Done!")).toBeTruthy();
    });
  });

  it("shows 'Could not load logs' and Retry button when logs fetch fails", async () => {
    (fetchProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Blob error"));
    renderPage();
    await waitFor(() =>
      expect(screen.getByText("Could not load logs")).toBeTruthy()
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("shows Pause button when polling is active", async () => {
    (fetchProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => screen.getByRole("heading", { level: 1 }));
    expect(screen.getByRole("button", { name: /Pause/ })).toBeTruthy();
  });

  it("toggles to Resume button after clicking Pause", async () => {
    (fetchProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /Pause/ }));
    fireEvent.click(screen.getByRole("button", { name: /Pause/ }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Resume/ })).toBeTruthy());
  });

  it("toggles back to Pause button after clicking Resume", async () => {
    (fetchProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /Pause/ }));
    fireEvent.click(screen.getByRole("button", { name: /Pause/ }));
    await waitFor(() => screen.getByRole("button", { name: /Resume/ }));
    fireEvent.click(screen.getByRole("button", { name: /Resume/ }));
    await waitFor(() => expect(screen.getByRole("button", { name: /Pause/ })).toBeTruthy());
  });

  it("polls logs on interval when polling is active", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      (fetchProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
      (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      renderPage();
      await waitFor(() => screen.getByRole("heading", { level: 1 }));
      const callsBefore = (fetchProjectLogs as ReturnType<typeof vi.fn>).mock.calls.length;
      await act(async () => {
        vi.advanceTimersByTime(7000);
      });
      expect((fetchProjectLogs as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(callsBefore);
    } finally {
      vi.useRealTimers();
    }
  });

  it("does not poll logs when polling is paused", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      (fetchProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
      (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      renderPage();
      await waitFor(() => screen.getByRole("button", { name: /Pause/ }));
      fireEvent.click(screen.getByRole("button", { name: /Pause/ }));
      await waitFor(() => screen.getByRole("button", { name: /Resume/ }));
      const callsAfterPause = (fetchProjectLogs as ReturnType<typeof vi.fn>).mock.calls.length;
      await act(async () => {
        vi.advanceTimersByTime(14000);
      });
      expect((fetchProjectLogs as ReturnType<typeof vi.fn>).mock.calls.length).toBe(callsAfterPause);
    } finally {
      vi.useRealTimers();
    }
  });

  it("Back to Dashboard link navigates to /", async () => {
    (fetchProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
    (fetchProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => screen.getByText(/Back to Dashboard/));
    fireEvent.click(screen.getByText(/Back to Dashboard/));
    await waitFor(() => expect(screen.getByTestId("dashboard")).toBeTruthy());
  });
});
