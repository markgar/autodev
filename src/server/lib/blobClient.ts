import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";

const STAMP_ID = process.env.STAMP_ID ?? "qqq";
const BLOB_URL = `https://stautodev${STAMP_ID}.blob.core.windows.net`;

const credential = new DefaultAzureCredential();
const blobServiceClient = new BlobServiceClient(BLOB_URL, credential);

function getBlobServiceClient(): BlobServiceClient {
  return blobServiceClient;
}

export { getBlobServiceClient };
