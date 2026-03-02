import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchProjects, formatDate } from "./api.js";

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

  it("throws Unknown error fallback when error body is not JSON", async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn().mockRejectedValue(new SyntaxError("not json")),
    });

    await expect(fetchProjects()).rejects.toThrow("Unknown error");
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
