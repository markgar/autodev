import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
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
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<><Toaster /><DashboardPage /></>} />
        <Route path="/projects/new" element={<div data-testid="new-project-page" />} />
      </Routes>
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
    await waitFor(() => expect(screen.getAllByText("My App").length).toBeGreaterThan(0));
  });

  it("shows error message when fetchProjects fails", async () => {
    (fetchProjects as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network failure"));
    renderPage();
    await waitFor(() => expect(screen.getByText("Failed to load projects")).toBeTruthy());
  });

  it("New Project button navigates to /projects/new", async () => {
    (fetchProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    const button = await screen.findByRole("button", { name: "New Project" });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByTestId("new-project-page")).toBeTruthy());
  });

  it("Create your first project button navigates to /projects/new", async () => {
    (fetchProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    const button = await screen.findByRole("button", { name: "Create your first project" });
    fireEvent.click(button);
    await waitFor(() => expect(screen.getByTestId("new-project-page")).toBeTruthy());
  });

  it("projects are displayed with most recently created first", async () => {
    const older = { ...sampleProject, id: "proj-old", name: "Older App", createdAt: "2024-01-01T00:00:00.000Z" };
    const newer = { ...sampleProject, id: "proj-new", name: "Newer App", createdAt: "2024-06-01T10:00:00.000Z" };
    (fetchProjects as ReturnType<typeof vi.fn>).mockResolvedValue([older, newer]);
    renderPage();
    await waitFor(() => {
      const names = screen.getAllByTestId("project-name").map((el) => el.textContent);
      expect(names[0]).toContain("Newer App");
    });
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
      expect(screen.getAllByText("My App").length).toBeGreaterThan(0);
      expect(screen.getAllByText("Second App").length).toBeGreaterThan(0);
    });
  });
});
