import { describe, it, expect, vi, beforeEach } from "vitest";
import { Router } from "express";

vi.mock("../lib/cosmosClient.js", () => ({
  client: {
    getDatabaseAccount: vi.fn(),
  },
}));

vi.mock("../lib/blobClient.js", () => ({
  getBlobServiceClient: vi.fn(() => ({
    getAccountInfo: vi.fn(),
  })),
}));

import { client as cosmosClient } from "../lib/cosmosClient.js";
import { getBlobServiceClient } from "../lib/blobClient.js";
import { healthRouter } from "./health.js";

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

function getHandler() {
  const layer = (healthRouter.stack as any[]).find(
    (l) => l.route?.path === "/" && l.route?.methods?.get
  );
  return layer.route.stack[0].handle;
}

describe("health route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports a Router instance", () => {
    const routerPrototype = Object.getPrototypeOf(Router());
    expect(Object.getPrototypeOf(healthRouter)).toBe(routerPrototype);
  });

  it("GET / responds with { status: 'ok' } when Azure is reachable", async () => {
    (cosmosClient.getDatabaseAccount as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (getBlobServiceClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getAccountInfo: vi.fn().mockResolvedValue({}),
    });

    const res = makeRes();
    await getHandler()({} as any, res, () => {});

    expect(res.body).toEqual({ status: "ok" });
    expect(res.statusCode).toBe(200);
  });

  it("GET / responds 503 with { status: 'error' } when Cosmos throws", async () => {
    (cosmosClient.getDatabaseAccount as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Cosmos unreachable")
    );

    const res = makeRes();
    await getHandler()({} as any, res, () => {});

    expect(res.statusCode).toBe(503);
    expect((res.body as any).status).toBe("error");
    expect(typeof (res.body as any).error).toBe("string");
  });

  it("GET / responds 503 with { status: 'error' } when Blob Storage throws", async () => {
    (cosmosClient.getDatabaseAccount as ReturnType<typeof vi.fn>).mockResolvedValue({});
    (getBlobServiceClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getAccountInfo: vi.fn().mockRejectedValue(new Error("Blob unreachable")),
    });

    const res = makeRes();
    await getHandler()({} as any, res, () => {});

    expect(res.statusCode).toBe(503);
    expect((res.body as any).status).toBe("error");
    expect((res.body as any).error).toContain("Blob unreachable");
  });
});

