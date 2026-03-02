import { describe, it, expect, vi, beforeEach } from "vitest";
import { Router } from "express";

vi.mock("../lib/projectsService.js", () => ({
  createProject: vi.fn(),
  listProjects: vi.fn(),
  getProject: vi.fn(),
}));

vi.mock("../lib/logsService.js", () => ({
  getProjectLogs: vi.fn(),
}));

vi.mock("../lib/blobClient.js", () => ({
  getBlobServiceClient: vi.fn(() => ({
    getContainerClient: vi.fn(() => ({
      createIfNotExists: vi.fn().mockResolvedValue({}),
    })),
  })),
}));

import { createProject, listProjects, getProject } from "../lib/projectsService.js";
import { getProjectLogs } from "../lib/logsService.js";
import { getBlobServiceClient } from "../lib/blobClient.js";
import { projectsRouter } from "./projects.js";

function makeRes() {
  let capturedBody: unknown;
  let capturedStatus = 200;
  const res: any = {
    json(body: unknown) {
      capturedBody = body;
      return res;
    },
    status(code: number) {
      capturedStatus = code;
      return res;
    },
    get body() {
      return capturedBody;
    },
    get statusCode() {
      return capturedStatus;
    },
  };
  return res;
}

function getRouteHandler(method: "get" | "post", path: string) {
  const layer = (projectsRouter.stack as any[]).find(
    (l) => l.route?.path === path && l.route?.methods?.[method]
  );
  if (!layer) {
    throw new Error(`No ${method.toUpperCase()} handler found for path "${path}" in projectsRouter`);
  }
  return layer.route.stack[0].handle;
}

const sampleProject = {
  id: "abc-123",
  organizationId: "default",
  type: "project",
  name: "Test App",
  specName: "minimal.md",
  createdAt: "2024-01-01T00:00:00.000Z",
  latestRunStatus: null,
  runCount: 0,
};

describe("projects router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports a Router instance", () => {
    const routerPrototype = Object.getPrototypeOf(Router());
    expect(Object.getPrototypeOf(projectsRouter)).toBe(routerPrototype);
  });

  describe("POST /", () => {
    it("returns 201 with project JSON when body is valid", async () => {
      (createProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
      const req = { body: { name: "Test App", specName: "minimal.md" } };
      const res = makeRes();
      await getRouteHandler("post", "/")(req as any, res, () => {});
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual(sampleProject);
    });

    it("returns 400 when name is missing", async () => {
      const req = { body: { specName: "minimal.md" } };
      const res = makeRes();
      await getRouteHandler("post", "/")(req as any, res, () => {});
      expect(res.statusCode).toBe(400);
      expect((res.body as any).error).toBeDefined();
    });

    it("returns 400 when specName is missing", async () => {
      const req = { body: { name: "Test App" } };
      const res = makeRes();
      await getRouteHandler("post", "/")(req as any, res, () => {});
      expect(res.statusCode).toBe(400);
      expect((res.body as any).error).toBeDefined();
    });

    it("returns 400 when name is empty string", async () => {
      const req = { body: { name: "", specName: "minimal.md" } };
      const res = makeRes();
      await getRouteHandler("post", "/")(req as any, res, () => {});
      expect(res.statusCode).toBe(400);
    });

    it("calls createProject with name and specName from body", async () => {
      (createProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
      const req = { body: { name: "My Project", specName: "full.md" } };
      const res = makeRes();
      await getRouteHandler("post", "/")(req as any, res, () => {});
      expect(createProject).toHaveBeenCalledWith("My Project", "full.md");
    });

    it("creates blob container for the new project", async () => {
      (createProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
      const mockCreateIfNotExists = vi.fn().mockResolvedValue({});
      (getBlobServiceClient as ReturnType<typeof vi.fn>).mockReturnValue({
        getContainerClient: vi.fn(() => ({ createIfNotExists: mockCreateIfNotExists })),
      });
      const req = { body: { name: "Test App", specName: "minimal.md" } };
      const res = makeRes();
      await getRouteHandler("post", "/")(req as any, res, () => {});
      expect(mockCreateIfNotExists).toHaveBeenCalled();
    });

    it("returns 500 when createProject throws", async () => {
      (createProject as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Cosmos failed"));
      const req = { body: { name: "Test App", specName: "minimal.md" } };
      const res = makeRes();
      await getRouteHandler("post", "/")(req as any, res, () => {});
      expect(res.statusCode).toBe(500);
      expect((res.body as any).error).toContain("Cosmos failed");
    });
  });

  describe("GET /", () => {
    it("returns 200 with array of projects", async () => {
      (listProjects as ReturnType<typeof vi.fn>).mockResolvedValue([sampleProject]);
      const res = makeRes();
      await getRouteHandler("get", "/")({}  as any, res, () => {});
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([sampleProject]);
    });

    it("returns 200 with empty array when no projects exist", async () => {
      (listProjects as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      const res = makeRes();
      await getRouteHandler("get", "/")({}  as any, res, () => {});
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("returns 500 when listProjects throws", async () => {
      (listProjects as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("DB error"));
      const res = makeRes();
      await getRouteHandler("get", "/")({}  as any, res, () => {});
      expect(res.statusCode).toBe(500);
      expect((res.body as any).error).toContain("DB error");
    });
  });

  describe("GET /:id", () => {
    it("returns 200 with project when found", async () => {
      (getProject as ReturnType<typeof vi.fn>).mockResolvedValue(sampleProject);
      const req = { params: { id: "abc-123" } };
      const res = makeRes();
      await getRouteHandler("get", "/:id")(req as any, res, () => {});
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(sampleProject);
    });

    it("returns 404 with error message when project not found", async () => {
      (getProject as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const req = { params: { id: "unknown-id" } };
      const res = makeRes();
      await getRouteHandler("get", "/:id")(req as any, res, () => {});
      expect(res.statusCode).toBe(404);
      expect((res.body as any).error).toBe("Project not found");
    });

    it("returns 500 when getProject throws", async () => {
      (getProject as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Cosmos error"));
      const req = { params: { id: "abc-123" } };
      const res = makeRes();
      await getRouteHandler("get", "/:id")(req as any, res, () => {});
      expect(res.statusCode).toBe(500);
      expect((res.body as any).error).toContain("Cosmos error");
    });
  });

  describe("GET /:id/logs", () => {
    it("returns 200 with lines array when logs exist", async () => {
      (getProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue(["line 1", "line 2"]);
      const req = { params: { id: "abc-123" } };
      const res = makeRes();
      await getRouteHandler("get", "/:id/logs")(req as any, res, () => {});
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ lines: ["line 1", "line 2"] });
    });

    it("returns 200 with empty lines array for new project with no logs", async () => {
      (getProjectLogs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      const req = { params: { id: "abc-123" } };
      const res = makeRes();
      await getRouteHandler("get", "/:id/logs")(req as any, res, () => {});
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ lines: [] });
    });

    it("returns 500 when getProjectLogs throws", async () => {
      (getProjectLogs as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Blob error"));
      const req = { params: { id: "abc-123" } };
      const res = makeRes();
      await getRouteHandler("get", "/:id/logs")(req as any, res, () => {});
      expect(res.statusCode).toBe(500);
      expect((res.body as any).error).toContain("Blob error");
    });
  });
});
