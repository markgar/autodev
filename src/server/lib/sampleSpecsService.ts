import { getBlobServiceClient } from "./blobClient.js";
import type { SampleSpec } from "../../shared/types.js";

const CONTAINER_NAME = "sample-specs";

function getContainerClient() {
  return getBlobServiceClient().getContainerClient(CONTAINER_NAME);
}

async function listSampleSpecs(): Promise<SampleSpec[]> {
  const containerClient = getContainerClient();
  const specs: SampleSpec[] = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    specs.push({
      name: blob.name,
      size: blob.properties.contentLength ?? 0,
      lastModified: blob.properties.lastModified?.toISOString() ?? "",
    });
  }
  return specs;
}

async function getSampleSpecContent(name: string): Promise<string | null> {
  const blockBlobClient = getContainerClient().getBlockBlobClient(name);
  try {
    const buffer = await blockBlobClient.downloadToBuffer();
    return buffer.toString("utf-8");
  } catch (err: unknown) {
    const code = (err as { code?: string; statusCode?: number })?.code ?? (err as { code?: string; statusCode?: number })?.statusCode;
    if (code === "BlobNotFound" || code === 404) {
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
