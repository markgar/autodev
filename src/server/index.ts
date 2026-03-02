import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createCosmosContainers } from "./lib/cosmosClient.js";
import { apiRouter } from "./routes/index.js";

const app = express();
const port = process.env.PORT ?? 3000;

const __dirname = dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use("/api", apiRouter);
app.use(express.static(join(__dirname, "../../dist/public")));

app.get("*", (_req, res) => {
  res.sendFile(join(__dirname, "../../dist/public/index.html"));
});

createCosmosContainers().catch((err) => {
  console.error("Failed to initialize Cosmos containers:", err);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
