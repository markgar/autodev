import { describe, it, expect } from "vitest";
import { Router } from "express";
import { healthRouter } from "./health.js";

describe("health route", () => {
  it("exports a Router instance", () => {
    const routerPrototype = Object.getPrototypeOf(Router());
    expect(Object.getPrototypeOf(healthRouter)).toBe(routerPrototype);
  });

  it("GET / responds with { status: 'ok' }", async () => {
    const req = {} as any;
    let capturedBody: unknown;
    const res = {
      json: (body: unknown) => {
        capturedBody = body;
      },
    } as any;

    const layer = (healthRouter.stack as any[]).find(
      (l) => l.route?.path === "/" && l.route?.methods?.get
    );
    expect(layer).toBeDefined();
    await layer.route.stack[0].handle(req, res, () => {});
    expect(capturedBody).toEqual({ status: "ok" });
  });
});
