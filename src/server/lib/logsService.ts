import { getBlobServiceClient } from "./blobClient.js";

const MAX_BLOB_BYTES = 10 * 1024 * 1024; // 10 MB per blob

async function getProjectLogs(projectId: string): Promise<string[]> {
  const containerClient = getBlobServiceClient().getContainerClient(projectId);
  const exists = await containerClient.exists();
  if (!exists) {
    return [];
  }

  const lines: string[] = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    if ((blob.properties.contentLength ?? 0) > MAX_BLOB_BYTES) {
      lines.push(`[log blob ${blob.name} too large to display]`);
      continue;
    }
    const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
    const buffer = await blockBlobClient.downloadToBuffer();
    const content = buffer.toString("utf-8");
    const blobLines = content.split("\n").filter((line) => line.length > 0);
    lines.push(...blobLines);
  }
  return lines;
}

export { getProjectLogs };
