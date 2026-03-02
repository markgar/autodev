import { Router } from "express";
import { client as cosmosClient } from "../lib/cosmosClient.js";
import { getBlobServiceClient } from "../lib/blobClient.js";

const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  try {
    await cosmosClient.getDatabaseAccount();
    await getBlobServiceClient().getAccountInfo();
    res.json({ status: "ok" });
  } catch (err) {
    res.status(503).json({ status: "error", error: String(err) });
  }
});

export { healthRouter };
