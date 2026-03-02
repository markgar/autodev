import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

// Mock the hookform resolver so tests work without the installed package
vi.mock("@hookform/resolvers/zod", () => ({
  zodResolver: (schema: { safeParseAsync: (v: unknown) => Promise<{ success: boolean; data?: unknown; error?: { issues: { path: string[]; message: string }[] } }> }) =>
    async (values: unknown) => {
      const result = await schema.safeParseAsync(values);
      if (result.success) {
        return { values: result.data, errors: {} };
      }
      const errors: Record<string, { message: string; type: string }> = {};
      for (const issue of result.error!.issues) {
        const path = issue.path.join(".");
        if (!errors[path]) {
          errors[path] = { message: issue.message, type: "validation" };
        }
      }
      return { values: {}, errors };
    },
}));

vi.mock("@/lib/api", () => ({
  fetchSampleSpecs: vi.fn(),
  createProject: vi.fn(),
}));

// Mock shadcn/ui Select with plain HTML select for easier test interaction
vi.mock("@/components/ui/select", () => ({
  Select: ({ children, value, onValueChange, disabled }: { children: React.ReactNode; value?: string; onValueChange?: (val: string) => void; disabled?: boolean }) =>
    React.createElement(
      "div",
      { "data-testid": "select-wrapper" },
      React.createElement(
        "select",
        {
          value: value ?? "",
          disabled,
          "data-testid": "spec-select",
          onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onValueChange?.(e.target.value),
        },
        children
      )
    ),
  SelectTrigger: ({ children, id }: { children: React.ReactNode; id?: string }) =>
    React.createElement("div", { id }, children),
  SelectValue: ({ placeholder }: { placeholder?: string }) =>
    React.createElement("span", null, placeholder),
  SelectContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  SelectItem: ({ children, value }: { children: React.ReactNode; value: string }) =>
    React.createElement("option", { value }, children),
}));

import { fetchSampleSpecs, createProject } from "@/lib/api";
import { NewProjectPage } from "./NewProjectPage.js";

const sampleSpecs = [
  { name: "minimal-node-api.md", size: 512, lastModified: "2024-06-01T00:00:00.000Z" },
  { name: "full-stack-app.md", size: 1024, lastModified: "2024-06-02T00:00:00.000Z" },
];

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/new"]}>
      <Routes>
        <Route path="/new" element={<><Toaster /><NewProjectPage /></>} />
        <Route path="/projects/:id" element={<div data-testid="project-detail" />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("NewProjectPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 'New Project' heading", () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue(sampleSpecs);
    renderPage();
    expect(screen.getByRole("heading", { name: "New Project" })).toBeTruthy();
  });

  it("renders Project Name label and input", () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue(sampleSpecs);
    renderPage();
    expect(screen.getByLabelText("Project Name")).toBeTruthy();
  });

  it("renders Sample Spec label", () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue(sampleSpecs);
    renderPage();
    expect(screen.getByText("Sample Spec")).toBeTruthy();
  });

  it("renders Create Project and Cancel buttons", () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue(sampleSpecs);
    renderPage();
    expect(screen.getByRole("button", { name: /Create Project/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeTruthy();
  });

  it("shows loading placeholder while specs are fetching", () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText("Loading specs…")).toBeTruthy();
  });

  it("shows 'No specs available' message when specs list is empty", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => expect(screen.getByText(/No specs available/)).toBeTruthy());
  });

  it("disables Create Project button when no specs are available", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    renderPage();
    await waitFor(() => {
      const btn = screen.getByRole("button", { name: /Create Project/ }) as HTMLButtonElement;
      expect(btn.disabled).toBe(true);
    });
  });

  it("shows error message and retry button when specs fail to load", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Failed to load specs: Network error/)).toBeTruthy();
      expect(screen.getByRole("button", { name: /Retry/ })).toBeTruthy();
    });
    // Submit button is NOT permanently disabled — user can fill the name and retry specs
    const btn = screen.getByRole("button", { name: /Create Project/ }) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });

  it("lists spec filenames without .md extension", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue(sampleSpecs);
    renderPage();
    await waitFor(() => {
      expect(screen.getByText("minimal-node-api")).toBeTruthy();
      expect(screen.getByText("full-stack-app")).toBeTruthy();
    });
  });

  it("Cancel button navigates to home", () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue(sampleSpecs);
    const { container } = renderPage();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(container.ownerDocument.location.pathname).toBe("/");
  });

  it("shows inline validation error when submitting with empty name", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue(sampleSpecs);
    renderPage();
    await waitFor(() => screen.getByRole("button", { name: /Create Project/ }));
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(screen.getByText("Name is required")).toBeTruthy());
    expect(createProject).not.toHaveBeenCalled();
  });

  it("calls createProject with name and specName on valid submission", async () => {
    const project = {
      id: "proj-123",
      organizationId: "default",
      type: "project" as const,
      name: "Test App",
      specName: "minimal-node-api.md",
      createdAt: "2024-06-01T00:00:00.000Z",
      latestRunStatus: null,
      runCount: 0,
    };
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue(sampleSpecs);
    (createProject as ReturnType<typeof vi.fn>).mockResolvedValue(project);
    renderPage();
    await waitFor(() => screen.getByTestId("spec-select"));
    fireEvent.change(screen.getByLabelText("Project Name"), { target: { value: "Test App" } });
    fireEvent.change(screen.getByTestId("spec-select"), { target: { value: "minimal-node-api.md" } });
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() =>
      expect(createProject).toHaveBeenCalledWith({ name: "Test App", specName: "minimal-node-api.md" })
    );
  });

  it("navigates to /projects/:id after successful project creation", async () => {
    const project = {
      id: "proj-456",
      organizationId: "default",
      type: "project" as const,
      name: "New App",
      specName: "full-stack-app.md",
      createdAt: "2024-06-15T00:00:00.000Z",
      latestRunStatus: null,
      runCount: 0,
    };
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue(sampleSpecs);
    (createProject as ReturnType<typeof vi.fn>).mockResolvedValue(project);
    renderPage();
    await waitFor(() => screen.getByTestId("spec-select"));
    fireEvent.change(screen.getByLabelText("Project Name"), { target: { value: "New App" } });
    fireEvent.change(screen.getByTestId("spec-select"), { target: { value: "full-stack-app.md" } });
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() =>
      expect(screen.getByTestId("project-detail")).toBeTruthy()
    );
  });

  it("shows toast error and re-enables submit when createProject fails", async () => {
    (fetchSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue(sampleSpecs);
    (createProject as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Creation failed"));
    renderPage();
    await waitFor(() => screen.getByTestId("spec-select"));
    fireEvent.change(screen.getByLabelText("Project Name"), { target: { value: "Test App" } });
    fireEvent.change(screen.getByTestId("spec-select"), { target: { value: "minimal-node-api.md" } });
    fireEvent.submit(document.querySelector("form")!);
    await waitFor(() => expect(screen.getByText("Creation failed")).toBeTruthy());
    const btn = screen.getByRole("button", { name: /Create Project/ }) as HTMLButtonElement;
    expect(btn.disabled).toBe(false);
  });
});
