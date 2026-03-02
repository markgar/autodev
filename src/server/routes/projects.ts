import { Router } from "express";
import { z } from "zod";
import { createProject, listProjects, getProject, deleteProject } from "../lib/projectsService.js";
import { getProjectLogs } from "../lib/logsService.js";
import { getBlobServiceClient } from "../lib/blobClient.js";

const projectsRouter = Router();

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  specName: z.string().min(1),
});

async function createProjectWithBlobContainer(name: string, specName: string) {
  const project = await createProject(name, specName);
  try {
    await getBlobServiceClient().getContainerClient(project.id).createIfNotExists();
  } catch (blobErr) {
    try {
      await deleteProject(project.id);
    } catch (deleteErr) {
      console.error("Failed to rollback Cosmos record after blob creation failure:", deleteErr);
    }
    throw blobErr;
  }
  return project;
}

projectsRouter.post("/", async (req, res) => {
  try {
    const result = CreateProjectSchema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ error: result.error.message });
      return;
    }
    const project = await createProjectWithBlobContainer(result.data.name, result.data.specName);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

projectsRouter.get("/", async (_req, res) => {
  try {
    const projects = await listProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

projectsRouter.get("/:id", async (req, res) => {
  try {
    const project = await getProject(req.params.id);
    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

projectsRouter.get("/:id/logs", async (req, res) => {
  try {
    const lines = await getProjectLogs(req.params.id);
    res.json({ lines });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export { projectsRouter };
