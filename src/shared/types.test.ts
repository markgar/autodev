import { describe, it, expect } from "vitest";
import type { Project, ApiError, SampleSpec } from "./types.js";

describe("shared types", () => {
  it("Project type accepts all valid latestRunStatus values", () => {
    const statuses: Project["latestRunStatus"][] = [
      "pending",
      "running",
      "succeeded",
      "failed",
      null,
    ];
    expect(statuses).toHaveLength(5);
  });

  it("a valid Project object satisfies the interface shape", () => {
    const project: Project = {
      id: "proj-1",
      organizationId: "default",
      type: "project",
      name: "My Project",
      specName: "sample.md",
      createdAt: new Date().toISOString(),
      latestRunStatus: "pending",
      runCount: 0,
    };
    expect(project.type).toBe("project");
    expect(project.organizationId).toBe("default");
  });

  it("an ApiError object has an error string field", () => {
    const err: ApiError = { error: "Something went wrong" };
    expect(typeof err.error).toBe("string");
  });

  it("a SampleSpec object has name, size, and lastModified fields", () => {
    const spec: SampleSpec = {
      name: "sample-spec.md",
      size: 1024,
      lastModified: new Date().toISOString(),
    };
    expect(typeof spec.name).toBe("string");
    expect(typeof spec.size).toBe("number");
    expect(typeof spec.lastModified).toBe("string");
  });
});
