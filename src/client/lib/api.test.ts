import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchProjects, fetchSampleSpecs, fetchProject, fetchProjectLogs, createProject, formatDate } from "./api.js";

const sampleProject = {
  id: "proj-1",
  organizationId: "default",
  type: "project" as const,
  name: "Test App",
  specName: "minimal.md",
  createdAt: "2024-01-01T00:00:00.000Z",
  latestRunStatus: null,
  runCount: 0,
};
describe("formatDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-06-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns seconds ago for very recent timestamps", () => {
    const iso = new Date(Date.now() - 30 * 1000).toISOString();
    const result = formatDate(iso);
    expect(result).toMatch(/30 seconds ago/);
  });

  it("returns minutes ago for timestamps within the hour", () => {
    const iso = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const result = formatDate(iso);
    expect(result).toMatch(/5 minutes ago/);
  });

  it("returns hours ago for timestamps within the day", () => {
    const iso = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const result = formatDate(iso);
    expect(result).toMatch(/3 hours ago/);
  });

  it("returns days ago for timestamps older than a day", () => {
    const iso = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString();
    const result = formatDate(iso);
    expect(result).toMatch(/4 days ago/);
  });
});

describe("fetchProjects", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns parsed project array on successful response", async () => {
    const projects = [
      {
        id: "proj-1",
        organizationId: "default",
        type: "project",
        name: "Test App",
        specName: "minimal.md",
        createdAt: "2024-01-01T00:00:00.000Z",
        latestRunStatus: null,
        runCount: 0,
      },
    ];
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(projects),
    });

    const result = await fetchProjects();
    expect(result).toEqual(projects);
  });

  it("calls GET /api/projects endpoint", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });

    await fetchProjects();
    expect(fetch).toHaveBeenCalledWith("/api/projects");
  });

  it("throws an error with server message on non-OK response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ error: "Database unavailable" }),
    });

    await expect(fetchProjects()).rejects.toThrow("Database unavailable");
  });

  it("throws HTTP status fallback when error body is not JSON", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn().mockRejectedValue(new SyntaxError("not json")),
    });

    await expect(fetchProjects()).rejects.toThrow("HTTP 503");
  });

  it("returns empty array when server returns no projects", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });

    const result = await fetchProjects();
    expect(result).toEqual([]);
  });
});

describe("fetchSampleSpecs", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls GET /api/sample-specs endpoint", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });

    await fetchSampleSpecs();
    expect(fetch).toHaveBeenCalledWith("/api/sample-specs");
  });

  it("returns parsed SampleSpec array on successful response", async () => {
    const specs = [{ name: "minimal.md", size: 512, lastModified: "2024-06-01T00:00:00.000Z" }];
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(specs),
    });

    const result = await fetchSampleSpecs();
    expect(result).toEqual(specs);
  });

  it("throws an error with server message on non-OK response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ error: "Blob storage unavailable" }),
    });

    await expect(fetchSampleSpecs()).rejects.toThrow("Blob storage unavailable");
  });

  it("returns empty array when no specs exist", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });

    const result = await fetchSampleSpecs();
    expect(result).toEqual([]);
  });
});

describe("createProject", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls POST /api/projects with JSON body", async () => {
    const project = {
      id: "proj-1", organizationId: "default", type: "project" as const,
      name: "My App", specName: "minimal.md", createdAt: "2024-06-01T00:00:00.000Z",
      latestRunStatus: null, runCount: 0,
    };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(project),
    });

    await createProject({ name: "My App", specName: "minimal.md" });

    expect(fetch).toHaveBeenCalledWith("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "My App", specName: "minimal.md" }),
    });
  });

  it("returns parsed Project on successful creation", async () => {
    const project = {
      id: "proj-2", organizationId: "default", type: "project" as const,
      name: "New App", specName: "full.md", createdAt: "2024-06-15T00:00:00.000Z",
      latestRunStatus: null, runCount: 0,
    };
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(project),
    });

    const result = await createProject({ name: "New App", specName: "full.md" });
    expect(result).toEqual(project);
  });

  it("throws an error with server message on non-OK response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 422,
      json: vi.fn().mockResolvedValue({ error: "Project name already exists" }),
    });

    await expect(createProject({ name: "Dupe App", specName: "minimal.md" })).rejects.toThrow("Project name already exists");
  });

  it("throws HTTP status fallback when error body is not JSON", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn().mockRejectedValue(new SyntaxError("not json")),
    });

    await expect(createProject({ name: "App", specName: "spec.md" })).rejects.toThrow("HTTP 503");
  });
});

describe("fetchProject", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls GET /api/projects/:id endpoint", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ ...sampleProject }),
    });

    await fetchProject("proj-1");
    expect(fetch).toHaveBeenCalledWith("/api/projects/proj-1");
  });

  it("returns project object on successful response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(sampleProject),
    });

    const result = await fetchProject("proj-1");
    expect(result).toEqual(sampleProject);
  });

  it("throws 'Project not found' error when server returns 404", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({ error: "Project not found" }),
    });

    await expect(fetchProject("unknown-id")).rejects.toThrow("Project not found");
  });

  it("throws error with server message on non-OK response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ error: "Cosmos unavailable" }),
    });

    await expect(fetchProject("proj-1")).rejects.toThrow("Cosmos unavailable");
  });

  it("throws HTTP status fallback when error body is not JSON", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn().mockRejectedValue(new SyntaxError("not json")),
    });

    await expect(fetchProject("proj-1")).rejects.toThrow("HTTP 503");
  });
});

describe("fetchProjectLogs", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls GET /api/projects/:id/logs endpoint", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ lines: [] }),
    });

    await fetchProjectLogs("proj-1");
    expect(fetch).toHaveBeenCalledWith("/api/projects/proj-1/logs");
  });

  it("returns lines array from response body", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ lines: ["Building...", "Done!"] }),
    });

    const result = await fetchProjectLogs("proj-1");
    expect(result).toEqual(["Building...", "Done!"]);
  });

  it("returns empty array when no log lines exist", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ lines: [] }),
    });

    const result = await fetchProjectLogs("proj-1");
    expect(result).toEqual([]);
  });

  it("throws error with server message on non-OK response", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ error: "Blob storage error" }),
    });

    await expect(fetchProjectLogs("proj-1")).rejects.toThrow("Blob storage error");
  });

  it("throws HTTP status fallback when error body is not JSON", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn().mockRejectedValue(new SyntaxError("not json")),
    });

    await expect(fetchProjectLogs("proj-1")).rejects.toThrow("HTTP 503");
  });
});
