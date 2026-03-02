import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./blobClient.js", () => ({
  getBlobServiceClient: vi.fn(),
}));

import { getBlobServiceClient } from "./blobClient.js";
import { getProjectLogs } from "./logsService.js";

function makeMockContainerClient(exists: boolean, blobs: Array<{ name: string; content: string }> = []) {
  const blockBlobClients: Record<string, { downloadToBuffer: ReturnType<typeof vi.fn> }> = {};
  for (const blob of blobs) {
    blockBlobClients[blob.name] = {
      downloadToBuffer: vi.fn().mockResolvedValue(Buffer.from(blob.content, "utf-8")),
    };
  }

  return {
    exists: vi.fn().mockResolvedValue(exists),
    listBlobsFlat: vi.fn(async function* () {
      for (const blob of blobs) {
        yield { name: blob.name, properties: { contentLength: Buffer.byteLength(blob.content, "utf-8") } };
      }
    }),
    getBlockBlobClient: vi.fn((name: string) => blockBlobClients[name]),
  };
}

describe("getProjectLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when container does not exist", async () => {
    const mockContainer = makeMockContainerClient(false);
    (getBlobServiceClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getContainerClient: vi.fn().mockReturnValue(mockContainer),
    });

    const result = await getProjectLogs("nonexistent-project-id");
    expect(result).toEqual([]);
  });

  it("returns empty array when container exists but has no blobs", async () => {
    const mockContainer = makeMockContainerClient(true, []);
    (getBlobServiceClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getContainerClient: vi.fn().mockReturnValue(mockContainer),
    });

    const result = await getProjectLogs("project-id-no-blobs");
    expect(result).toEqual([]);
  });

  it("returns log lines from a single blob", async () => {
    const mockContainer = makeMockContainerClient(true, [
      { name: "build.log", content: "Starting build\nCompiling...\nBuild complete" },
    ]);
    (getBlobServiceClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getContainerClient: vi.fn().mockReturnValue(mockContainer),
    });

    const result = await getProjectLogs("project-id");
    expect(result).toEqual(["Starting build", "Compiling...", "Build complete"]);
  });

  it("filters out empty lines from blob content", async () => {
    const mockContainer = makeMockContainerClient(true, [
      { name: "build.log", content: "line one\n\nline two\n\n" },
    ]);
    (getBlobServiceClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getContainerClient: vi.fn().mockReturnValue(mockContainer),
    });

    const result = await getProjectLogs("project-id");
    expect(result).toEqual(["line one", "line two"]);
  });

  it("merges lines from multiple blobs into flat array", async () => {
    const mockContainer = makeMockContainerClient(true, [
      { name: "step1.log", content: "step 1 started\nstep 1 done" },
      { name: "step2.log", content: "step 2 started\nstep 2 done" },
    ]);
    (getBlobServiceClient as ReturnType<typeof vi.fn>).mockReturnValue({
      getContainerClient: vi.fn().mockReturnValue(mockContainer),
    });

    const result = await getProjectLogs("project-id");
    expect(result).toEqual(["step 1 started", "step 1 done", "step 2 started", "step 2 done"]);
  });

  it("uses the projectId as the container name", async () => {
    const getContainerClient = vi.fn().mockReturnValue(makeMockContainerClient(false));
    (getBlobServiceClient as ReturnType<typeof vi.fn>).mockReturnValue({ getContainerClient });

    await getProjectLogs("my-project-id");
    expect(getContainerClient).toHaveBeenCalledWith("my-project-id");
  });
});
