import { client } from "./cosmosClient.js";
import type { Project } from "../../shared/types.js";

const container = () => client.database("autodev").container("items");

async function createProject(name: string, specName: string): Promise<Project> {
  const doc: Project = {
    id: crypto.randomUUID(),
    organizationId: "default",
    type: "project",
    name,
    specName,
    createdAt: new Date().toISOString(),
    latestRunStatus: null,
    runCount: 0,
  };
  const { resource } = await container().items.create(doc);
  return resource as Project;
}

async function listProjects(): Promise<Project[]> {
  const query = `SELECT * FROM c WHERE c.organizationId = "default" AND c.type = "project" ORDER BY c.createdAt DESC`;
  const { resources } = await container().items.query<Project>(query).fetchAll();
  return resources;
}

async function getProject(id: string): Promise<Project | null> {
  const { resource } = await container().item(id, "default").read<Project>();
  return resource ?? null;
}

export { createProject, listProjects, getProject };
