import { getBlobServiceClient } from "./blobClient.js";

async function getProjectLogs(projectId: string): Promise<string[]> {
  const containerClient = getBlobServiceClient().getContainerClient(projectId);
  const exists = await containerClient.exists();
  if (!exists) {
    return [];
  }

  const lines: string[] = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    const blockBlobClient = containerClient.getBlockBlobClient(blob.name);
    const buffer = await blockBlobClient.downloadToBuffer();
    const content = buffer.toString("utf-8");
    const blobLines = content.split("\n").filter((line) => line.length > 0);
    lines.push(...blobLines);
  }
  return lines;
}

export { getProjectLogs };
