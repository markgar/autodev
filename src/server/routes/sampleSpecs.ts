import { Router } from "express";
import multer from "multer";
import {
  listSampleSpecs,
  getSampleSpecContent,
  uploadSampleSpec,
  deleteSampleSpec,
} from "../lib/sampleSpecsService.js";

const sampleSpecsRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

sampleSpecsRouter.get("/", async (_req, res) => {
  try {
    const specs = await listSampleSpecs();
    res.json(specs);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

sampleSpecsRouter.get("/:name", async (req, res) => {
  try {
    const content = await getSampleSpecContent(req.params.name);
    if (content === null) {
      res.status(404).json({ error: "Spec not found" });
      return;
    }
    res.json({ name: req.params.name, content });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

sampleSpecsRouter.post("/", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ error: "File too large (max 5 MB)" });
      return;
    }
    if (err) {
      next(err);
      return;
    }
    next();
  });
}, async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  if (!req.file.originalname.endsWith(".md")) {
    res.status(400).json({ error: "File must be a .md file" });
    return;
  }
  try {
    await uploadSampleSpec(
      req.file.originalname,
      req.file.buffer,
      req.file.mimetype || "text/markdown"
    );
    res.status(201).json({ name: req.file.originalname });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

sampleSpecsRouter.delete("/:name", async (req, res) => {
  try {
    await deleteSampleSpec(req.params.name);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export { sampleSpecsRouter };
