import { getBlobServiceClient } from "./blobClient.js";
import type { SampleSpec } from "../../shared/types.js";

const CONTAINER_NAME = "sample-specs";

function getContainerClient() {
  return getBlobServiceClient().getContainerClient(CONTAINER_NAME);
}

async function listSampleSpecs(): Promise<SampleSpec[]> {
  const containerClient = getContainerClient();
  const exists = await containerClient.exists();
  if (!exists) {
    return [];
  }
  const specs: SampleSpec[] = [];
  try {
    for await (const blob of containerClient.listBlobsFlat()) {
      specs.push({
        name: blob.name,
        size: blob.properties.contentLength ?? 0,
        lastModified: blob.properties.lastModified?.toISOString() ?? "",
      });
    }
  } catch (err: unknown) {
    const e = err as { statusCode?: number; code?: string };
    if (e?.statusCode === 404 || e?.code === "ContainerNotFound") {
      return [];
    }
    throw err;
  }
  return specs;
}

const MAX_SPEC_BYTES = 1 * 1024 * 1024; // 1 MB — specs are markdown, should be tiny

async function getSampleSpecContent(name: string): Promise<string | null> {
  const blockBlobClient = getContainerClient().getBlockBlobClient(name);
  try {
    const buffer = await blockBlobClient.downloadToBuffer(0, MAX_SPEC_BYTES);
    return buffer.toString("utf-8");
  } catch (err: unknown) {
    const e = err as { code?: string; statusCode?: number };
    if (e?.code === "BlobNotFound" || e?.statusCode === 404) {
      return null;
    }
    throw err;
  }
}

async function uploadSampleSpec(name: string, buffer: Buffer, contentType: string): Promise<void> {
  const blockBlobClient = getContainerClient().getBlockBlobClient(name);
  await blockBlobClient.upload(buffer, buffer.length, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
}

async function deleteSampleSpec(name: string): Promise<void> {
  const blockBlobClient = getContainerClient().getBlockBlobClient(name);
  await blockBlobClient.deleteIfExists();
}

export { listSampleSpecs, getSampleSpecContent, uploadSampleSpec, deleteSampleSpec };
