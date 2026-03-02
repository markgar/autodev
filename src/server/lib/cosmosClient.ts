import { CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";

const STAMP_ID = process.env.STAMP_ID ?? "qqq";
const COSMOS_URL = `https://cosmos-autodev-${STAMP_ID}.documents.azure.com:443/`;

const credential = new DefaultAzureCredential();
const client = new CosmosClient({ endpoint: COSMOS_URL, aadCredentials: credential });

async function createCosmosContainers(): Promise<void> {
  try {
    const { database } = await client.databases.createIfNotExists({ id: "autodev" });
    await database.containers.createIfNotExists({
      id: "items",
      partitionKey: { paths: ["/organizationId"] },
    });
  } catch (err) {
    throw err;
  }
}

export { client, createCosmosContainers };
