import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";
import { createCosmosContainers } from "./lib/cosmosClient.js";
import { apiRouter } from "./routes/index.js";

const app = express();
const port = process.env.PORT ?? 3000;

const __dirname = dirname(fileURLToPath(import.meta.url));

const distPublicPath = process.env.NODE_ENV === "production"
  ? join(__dirname, "../../../dist/public")
  : join(__dirname, "../../dist/public");

if (!existsSync(distPublicPath)) {
  if (process.env.NODE_ENV === "production") {
    console.error("[startup] Static assets not found at:", distPublicPath);
    process.exit(1);
  } else {
    console.warn("[startup] Static assets not found at:", distPublicPath, "— running in API-only mode");
  }
}

app.use(express.json());
app.use("/api", apiRouter);
app.use(express.static(distPublicPath));

app.get("*", (_req, res) => {
  res.sendFile(join(distPublicPath, "index.html"));
});

createCosmosContainers().catch((err) => {
  console.error("Failed to initialize Cosmos containers:", err);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
