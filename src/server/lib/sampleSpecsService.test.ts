import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("./blobClient.js", () => ({
  getBlobServiceClient: vi.fn(),
}));

import { getBlobServiceClient } from "./blobClient.js";
import { listSampleSpecs, getSampleSpecContent, uploadSampleSpec, deleteSampleSpec } from "./sampleSpecsService.js";

type MockBlob = {
  name: string;
  contentLength?: number;
  lastModified?: Date;
};

function makeMockBlockBlobClient(options: {
  downloadBuffer?: Buffer;
  downloadError?: { code?: string; statusCode?: number } | Error;
  uploadSpy?: ReturnType<typeof vi.fn>;
  deleteIfExistsSpy?: ReturnType<typeof vi.fn>;
}) {
  return {
    downloadToBuffer: options.downloadError
      ? vi.fn().mockRejectedValue(options.downloadError)
      : vi.fn().mockResolvedValue(options.downloadBuffer ?? Buffer.from("")),
    upload: options.uploadSpy ?? vi.fn().mockResolvedValue({}),
    deleteIfExists: options.deleteIfExistsSpy ?? vi.fn().mockResolvedValue({ succeeded: true }),
  };
}

function makeMockContainerClient(blobs: MockBlob[] = [], blockBlobClientFactory?: (name: string) => ReturnType<typeof makeMockBlockBlobClient>) {
  return {
    listBlobsFlat: vi.fn(async function* () {
      for (const blob of blobs) {
        yield {
          name: blob.name,
          properties: {
            contentLength: blob.contentLength,
            lastModified: blob.lastModified,
          },
        };
      }
    }),
    getBlockBlobClient: vi.fn((name: string) => {
      if (blockBlobClientFactory) return blockBlobClientFactory(name);
      return makeMockBlockBlobClient({});
    }),
  };
}

function setupMockBlobService(containerClient: ReturnType<typeof makeMockContainerClient>) {
  (getBlobServiceClient as ReturnType<typeof vi.fn>).mockReturnValue({
    getContainerClient: vi.fn().mockReturnValue(containerClient),
  });
}

describe("listSampleSpecs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when container has no blobs", async () => {
    setupMockBlobService(makeMockContainerClient([]));
    const result = await listSampleSpecs();
    expect(result).toEqual([]);
  });

  it("maps blob items to SampleSpec shape with name, size, and lastModified", async () => {
    const lastModified = new Date("2024-06-01T10:00:00.000Z");
    setupMockBlobService(makeMockContainerClient([
      { name: "my-spec.md", contentLength: 512, lastModified },
    ]));
    const result = await listSampleSpecs();
    expect(result).toEqual([
      { name: "my-spec.md", size: 512, lastModified: "2024-06-01T10:00:00.000Z" },
    ]);
  });

  it("defaults size to 0 when contentLength is undefined", async () => {
    setupMockBlobService(makeMockContainerClient([
      { name: "no-size.md", contentLength: undefined, lastModified: new Date("2024-01-01T00:00:00.000Z") },
    ]));
    const result = await listSampleSpecs();
    expect(result[0].size).toBe(0);
  });

  it("defaults lastModified to empty string when undefined", async () => {
    setupMockBlobService(makeMockContainerClient([
      { name: "no-date.md", contentLength: 100, lastModified: undefined },
    ]));
    const result = await listSampleSpecs();
    expect(result[0].lastModified).toBe("");
  });

  it("returns all blobs when multiple exist", async () => {
    const date = new Date("2024-03-15T08:30:00.000Z");
    setupMockBlobService(makeMockContainerClient([
      { name: "spec-a.md", contentLength: 100, lastModified: date },
      { name: "spec-b.md", contentLength: 200, lastModified: date },
      { name: "spec-c.md", contentLength: 300, lastModified: date },
    ]));
    const result = await listSampleSpecs();
    expect(result).toHaveLength(3);
    expect(result.map((s) => s.name)).toEqual(["spec-a.md", "spec-b.md", "spec-c.md"]);
  });

  it("uses the sample-specs container", async () => {
    const getContainerClient = vi.fn().mockReturnValue(makeMockContainerClient([]));
    (getBlobServiceClient as ReturnType<typeof vi.fn>).mockReturnValue({ getContainerClient });
    await listSampleSpecs();
    expect(getContainerClient).toHaveBeenCalledWith("sample-specs");
  });
});

describe("getSampleSpecContent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns file content as string for an existing blob", async () => {
    const content = "# My Sample Spec\n\nThis is a test spec.";
    const blockBlobClient = makeMockBlockBlobClient({ downloadBuffer: Buffer.from(content, "utf-8") });
    const containerClient = makeMockContainerClient([], () => blockBlobClient);
    setupMockBlobService(containerClient);

    const result = await getSampleSpecContent("my-spec.md");
    expect(result).toBe(content);
  });

  it("returns null when blob does not exist (BlobNotFound code)", async () => {
    const blockBlobClient = makeMockBlockBlobClient({ downloadError: { code: "BlobNotFound" } });
    const containerClient = makeMockContainerClient([], () => blockBlobClient);
    setupMockBlobService(containerClient);

    const result = await getSampleSpecContent("missing.md");
    expect(result).toBeNull();
  });

  it("returns null when blob does not exist (404 status code)", async () => {
    const blockBlobClient = makeMockBlockBlobClient({ downloadError: { statusCode: 404 } });
    const containerClient = makeMockContainerClient([], () => blockBlobClient);
    setupMockBlobService(containerClient);

    const result = await getSampleSpecContent("missing.md");
    expect(result).toBeNull();
  });

  it("re-throws unexpected errors from blob download", async () => {
    const blockBlobClient = makeMockBlockBlobClient({ downloadError: new Error("Network timeout") });
    const containerClient = makeMockContainerClient([], () => blockBlobClient);
    setupMockBlobService(containerClient);

    await expect(getSampleSpecContent("spec.md")).rejects.toThrow("Network timeout");
  });

  it("fetches the blob by its name", async () => {
    const blockBlobClient = makeMockBlockBlobClient({ downloadBuffer: Buffer.from("content") });
    const getBlockBlobClient = vi.fn().mockReturnValue(blockBlobClient);
    const containerClient = { ...makeMockContainerClient([]), getBlockBlobClient };
    setupMockBlobService(containerClient);

    await getSampleSpecContent("target-spec.md");
    expect(getBlockBlobClient).toHaveBeenCalledWith("target-spec.md");
  });
});

describe("uploadSampleSpec", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads buffer to the named blob", async () => {
    const uploadSpy = vi.fn().mockResolvedValue({});
    const blockBlobClient = makeMockBlockBlobClient({ uploadSpy });
    const containerClient = makeMockContainerClient([], () => blockBlobClient);
    setupMockBlobService(containerClient);

    const buffer = Buffer.from("# Hello World");
    await uploadSampleSpec("hello.md", buffer, "text/markdown");

    expect(uploadSpy).toHaveBeenCalledWith(buffer, buffer.length, {
      blobHTTPHeaders: { blobContentType: "text/markdown" },
    });
  });

  it("sets the correct content type in blob headers", async () => {
    const uploadSpy = vi.fn().mockResolvedValue({});
    const blockBlobClient = makeMockBlockBlobClient({ uploadSpy });
    const containerClient = makeMockContainerClient([], () => blockBlobClient);
    setupMockBlobService(containerClient);

    await uploadSampleSpec("spec.md", Buffer.from("content"), "application/octet-stream");

    expect(uploadSpy).toHaveBeenCalledWith(
      expect.any(Buffer),
      expect.any(Number),
      { blobHTTPHeaders: { blobContentType: "application/octet-stream" } }
    );
  });

  it("uploads to the blob named by the name argument", async () => {
    const uploadSpy = vi.fn().mockResolvedValue({});
    const getBlockBlobClient = vi.fn().mockReturnValue({ upload: uploadSpy });
    const containerClient = { ...makeMockContainerClient([]), getBlockBlobClient };
    setupMockBlobService(containerClient);

    await uploadSampleSpec("my-project-spec.md", Buffer.from("data"), "text/markdown");
    expect(getBlockBlobClient).toHaveBeenCalledWith("my-project-spec.md");
  });
});

describe("deleteSampleSpec", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls deleteIfExists on the named blob", async () => {
    const deleteIfExistsSpy = vi.fn().mockResolvedValue({ succeeded: true });
    const blockBlobClient = makeMockBlockBlobClient({ deleteIfExistsSpy });
    const containerClient = makeMockContainerClient([], () => blockBlobClient);
    setupMockBlobService(containerClient);

    await deleteSampleSpec("old-spec.md");
    expect(deleteIfExistsSpy).toHaveBeenCalled();
  });

  it("targets the correct blob by name", async () => {
    const deleteIfExistsSpy = vi.fn().mockResolvedValue({ succeeded: true });
    const getBlockBlobClient = vi.fn().mockReturnValue({ deleteIfExists: deleteIfExistsSpy });
    const containerClient = { ...makeMockContainerClient([]), getBlockBlobClient };
    setupMockBlobService(containerClient);

    await deleteSampleSpec("to-delete.md");
    expect(getBlockBlobClient).toHaveBeenCalledWith("to-delete.md");
  });

  it("does not throw when blob does not exist (deleteIfExists handles it)", async () => {
    const deleteIfExistsSpy = vi.fn().mockResolvedValue({ succeeded: false });
    const blockBlobClient = makeMockBlockBlobClient({ deleteIfExistsSpy });
    const containerClient = makeMockContainerClient([], () => blockBlobClient);
    setupMockBlobService(containerClient);

    await expect(deleteSampleSpec("nonexistent.md")).resolves.toBeUndefined();
  });
});
