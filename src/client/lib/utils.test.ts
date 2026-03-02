import { describe, it, expect } from "vitest";
import { cn } from "./utils.js";

describe("cn utility", () => {
  it("returns a single class unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("merges multiple classes", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("deduplicates conflicting Tailwind classes keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("filters out falsy values", () => {
    expect(cn("foo", undefined, null, false, "bar")).toBe("foo bar");
  });

  it("supports conditional object syntax", () => {
    expect(cn({ "text-red-500": true, "text-blue-500": false })).toBe("text-red-500");
  });

  it("merges Tailwind color classes correctly", () => {
    expect(cn("text-white", "text-black")).toBe("text-black");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});
