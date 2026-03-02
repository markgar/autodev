import { describe, it, expect, vi, beforeEach } from "vitest";
import { Router } from "express";

vi.mock("../lib/sampleSpecsService.js", () => ({
  listSampleSpecs: vi.fn(),
  getSampleSpecContent: vi.fn(),
  uploadSampleSpec: vi.fn(),
  deleteSampleSpec: vi.fn(),
}));

import {
  listSampleSpecs,
  getSampleSpecContent,
  uploadSampleSpec,
  deleteSampleSpec,
} from "../lib/sampleSpecsService.js";
import { sampleSpecsRouter } from "./sampleSpecs.js";

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
    send() {
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

function getRouteHandler(method: "get" | "post" | "delete", path: string, stackIndex = 0) {
  const layer = (sampleSpecsRouter.stack as any[]).find(
    (l) => l.route?.path === path && l.route?.methods?.[method]
  );
  if (!layer) {
    throw new Error(`No route registered for ${method.toUpperCase()} ${path}`);
  }
  const handler = layer.route.stack[stackIndex]?.handle;
  if (!handler) {
    throw new Error(`No handler at stack index ${stackIndex} for ${method.toUpperCase()} ${path}`);
  }
  return handler;
}

const sampleSpec = {
  name: "my-spec.md",
  size: 512,
  lastModified: "2024-06-01T00:00:00.000Z",
};

describe("sampleSpecs router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports a Router instance", () => {
    const routerPrototype = Object.getPrototypeOf(Router());
    expect(Object.getPrototypeOf(sampleSpecsRouter)).toBe(routerPrototype);
  });

  describe("GET /", () => {
    it("returns 200 with array of sample specs", async () => {
      (listSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([sampleSpec]);
      const res = makeRes();
      await getRouteHandler("get", "/")({}  as any, res, () => {});
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([sampleSpec]);
    });

    it("returns 200 with empty array when no specs exist", async () => {
      (listSampleSpecs as ReturnType<typeof vi.fn>).mockResolvedValue([]);
      const res = makeRes();
      await getRouteHandler("get", "/")({}  as any, res, () => {});
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("returns 500 when listSampleSpecs throws", async () => {
      (listSampleSpecs as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Blob unavailable"));
      const res = makeRes();
      await getRouteHandler("get", "/")({}  as any, res, () => {});
      expect(res.statusCode).toBe(500);
      expect((res.body as any).error).toContain("Blob unavailable");
    });
  });

  describe("GET /:name", () => {
    it("returns 200 with name and content when spec exists", async () => {
      (getSampleSpecContent as ReturnType<typeof vi.fn>).mockResolvedValue("# My Spec\n\nContent here.");
      const req = { params: { name: "my-spec.md" } };
      const res = makeRes();
      await getRouteHandler("get", "/:name")(req as any, res, () => {});
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({ name: "my-spec.md", content: "# My Spec\n\nContent here." });
    });

    it("returns 404 when spec does not exist", async () => {
      (getSampleSpecContent as ReturnType<typeof vi.fn>).mockResolvedValue(null);
      const req = { params: { name: "does-not-exist.md" } };
      const res = makeRes();
      await getRouteHandler("get", "/:name")(req as any, res, () => {});
      expect(res.statusCode).toBe(404);
      expect((res.body as any).error).toBe("Spec not found");
    });

    it("returns 500 when getSampleSpecContent throws", async () => {
      (getSampleSpecContent as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Network error"));
      const req = { params: { name: "spec.md" } };
      const res = makeRes();
      await getRouteHandler("get", "/:name")(req as any, res, () => {});
      expect(res.statusCode).toBe(500);
      expect((res.body as any).error).toContain("Network error");
    });

    it("calls getSampleSpecContent with the name from route params", async () => {
      (getSampleSpecContent as ReturnType<typeof vi.fn>).mockResolvedValue("content");
      const req = { params: { name: "specific-spec.md" } };
      const res = makeRes();
      await getRouteHandler("get", "/:name")(req as any, res, () => {});
      expect(getSampleSpecContent).toHaveBeenCalledWith("specific-spec.md");
    });
  });

  describe("POST /", () => {
    // POST / has multer middleware at stack[0]; the handler is at stack[1]
    it("returns 400 when no file is uploaded", async () => {
      const req = { file: undefined };
      const res = makeRes();
      await getRouteHandler("post", "/", 1)(req as any, res, () => {});
      expect(res.statusCode).toBe(400);
      expect((res.body as any).error).toBeDefined();
    });

    it("returns 400 when uploaded file does not end with .md", async () => {
      const req = { file: { originalname: "spec.txt", buffer: Buffer.from("data"), mimetype: "text/plain" } };
      const res = makeRes();
      await getRouteHandler("post", "/", 1)(req as any, res, () => {});
      expect(res.statusCode).toBe(400);
      expect((res.body as any).error).toBeDefined();
    });

    it("returns 201 with name when valid .md file is uploaded", async () => {
      (uploadSampleSpec as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const req = { file: { originalname: "my-spec.md", buffer: Buffer.from("# Hello"), mimetype: "text/markdown" } };
      const res = makeRes();
      await getRouteHandler("post", "/", 1)(req as any, res, () => {});
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({ name: "my-spec.md" });
    });

    it("calls uploadSampleSpec with correct name, buffer and content type", async () => {
      (uploadSampleSpec as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const buffer = Buffer.from("# Spec content");
      const req = { file: { originalname: "upload.md", buffer, mimetype: "text/markdown" } };
      const res = makeRes();
      await getRouteHandler("post", "/", 1)(req as any, res, () => {});
      expect(uploadSampleSpec).toHaveBeenCalledWith("upload.md", buffer, "text/markdown");
    });

    it("defaults content type to text/markdown when mimetype is empty", async () => {
      (uploadSampleSpec as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const buffer = Buffer.from("content");
      const req = { file: { originalname: "spec.md", buffer, mimetype: "" } };
      const res = makeRes();
      await getRouteHandler("post", "/", 1)(req as any, res, () => {});
      expect(uploadSampleSpec).toHaveBeenCalledWith("spec.md", buffer, "text/markdown");
    });

    it("returns 500 when uploadSampleSpec throws", async () => {
      (uploadSampleSpec as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Upload failed"));
      const req = { file: { originalname: "spec.md", buffer: Buffer.from("data"), mimetype: "text/markdown" } };
      const res = makeRes();
      await getRouteHandler("post", "/", 1)(req as any, res, () => {});
      expect(res.statusCode).toBe(500);
      expect((res.body as any).error).toContain("Upload failed");
    });
  });

  describe("DELETE /:name", () => {
    it("returns 204 when spec is deleted successfully", async () => {
      (deleteSampleSpec as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const req = { params: { name: "old-spec.md" } };
      const res = makeRes();
      await getRouteHandler("delete", "/:name")(req as any, res, () => {});
      expect(res.statusCode).toBe(204);
    });

    it("calls deleteSampleSpec with the name from route params", async () => {
      (deleteSampleSpec as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
      const req = { params: { name: "to-delete.md" } };
      const res = makeRes();
      await getRouteHandler("delete", "/:name")(req as any, res, () => {});
      expect(deleteSampleSpec).toHaveBeenCalledWith("to-delete.md");
    });

    it("returns 500 when deleteSampleSpec throws", async () => {
      (deleteSampleSpec as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Delete failed"));
      const req = { params: { name: "spec.md" } };
      const res = makeRes();
      await getRouteHandler("delete", "/:name")(req as any, res, () => {});
      expect(res.statusCode).toBe(500);
      expect((res.body as any).error).toContain("Delete failed");
    });
  });
});
