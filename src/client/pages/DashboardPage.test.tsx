import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { DashboardPage } from "./DashboardPage.js";

vi.mock("@/lib/api", () => ({
  fetchProjects: vi.fn(),
  formatDate: vi.fn(() => "2 hours ago"),
}));

import { fetchProjects } from "@/lib/api";

const sampleProject = {
  id: "proj-1",
  organizationId: "default",
  type: "project" as const,
  name: "My App",
  specName: "minimal.md",
  createdAt: "2024-06-01T10:00:00.000Z",
  latestRunStatus: null as null,
  runCount: 0,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <Toaster />
      <DashboardPage />
    </MemoryRouter>
  );
}

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows skeleton while loading", () => {
    (fetchProjects as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(document.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("renders Projects heading", async () => {
    (fetchProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByRole("heading", { name: "Projects" })).toBeTruthy());
  });

  it("renders New Project button", async () => {
    (fetchProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByRole("button", { name: "New Project" })).toBeTruthy());
  });

  it("shows empty state message when no projects exist", async () => {
    (fetchProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() =>
      expect(screen.getByText(/No projects yet/)).toBeTruthy()
    );
  });

  it("renders project name for each loaded project", async () => {
    (fetchProjects as ReturnType<typeof vi.fn>).mockResolvedValue([sampleProject]);
    renderPage();
    await waitFor(() => expect(screen.getByText("My App")).toBeTruthy());
  });

  it("renders project spec name in the row", async () => {
    (fetchProjects as ReturnType<typeof vi.fn>).mockResolvedValue([sampleProject]);
    renderPage();
    await waitFor(() => expect(screen.getByText(/minimal\.md/)).toBeTruthy());
  });

  it("shows no runs badge when latestRunStatus is null", async () => {
    (fetchProjects as ReturnType<typeof vi.fn>).mockResolvedValue([sampleProject]);
    renderPage();
    await waitFor(() => expect(screen.getByText("no runs")).toBeTruthy());
  });

  it("shows succeeded badge with correct status", async () => {
    const project = { ...sampleProject, latestRunStatus: "succeeded" as const };
    (fetchProjects as ReturnType<typeof vi.fn>).mockResolvedValue([project]);
    renderPage();
    await waitFor(() => expect(screen.getByText("succeeded")).toBeTruthy());
  });

  it("shows failed badge with correct status", async () => {
    const project = { ...sampleProject, latestRunStatus: "failed" as const };
    (fetchProjects as ReturnType<typeof vi.fn>).mockResolvedValue([project]);
    renderPage();
    await waitFor(() => expect(screen.getByText("failed")).toBeTruthy());
  });

  it("shows error message when fetchProjects fails", async () => {
    (fetchProjects as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network failure"));
    renderPage();
    await waitFor(() => expect(screen.getByText("Network failure")).toBeTruthy());
  });

  it("shows Retry button on error", async () => {
    (fetchProjects as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Oops"));
    renderPage();
    await waitFor(() => expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy());
  });

  it("retries fetch when Retry button is clicked", async () => {
    (fetchProjects as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(new Error("first failure"))
      .mockResolvedValue([]);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: "Retry" }));
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(fetchProjects).toHaveBeenCalledTimes(2));
  });

  it("renders multiple projects", async () => {
    const second = { ...sampleProject, id: "proj-2", name: "Second App" };
    (fetchProjects as ReturnType<typeof vi.fn>).mockResolvedValue([sampleProject, second]);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("My App")).toBeTruthy();
      expect(screen.getByText("Second App")).toBeTruthy();
    });
  });
});
