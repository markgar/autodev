import { describe, it, expect } from "vitest";
import { cn, formatFileSize } from "./utils.js";

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

describe("formatFileSize", () => {
  it("formats bytes under 1 KB with comma separator and B suffix", () => {
    expect(formatFileSize(1023)).toBe("1,023 B");
  });

  it("formats exactly 0 bytes as '0 B'", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats kilobytes with one decimal place and KB suffix", () => {
    expect(formatFileSize(12400)).toBe("12.1 KB");
  });

  it("formats whole kilobytes without trailing .0", () => {
    expect(formatFileSize(1024)).toBe("1 KB");
  });

  it("formats megabytes with one decimal place and MB suffix", () => {
    expect(formatFileSize(1500000)).toBe("1.4 MB");
  });

  it("formats whole megabytes without trailing .0", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1 MB");
  });

  it("returns em dash for negative input", () => {
    expect(formatFileSize(-100)).toBe("—");
  });

  it("returns em dash for NaN", () => {
    expect(formatFileSize(NaN)).toBe("—");
  });

  it("returns em dash for Infinity", () => {
    expect(formatFileSize(Infinity)).toBe("—");
  });
});
