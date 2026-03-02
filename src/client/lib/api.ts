import type { Project } from "../../shared/types";

export async function fetchProjects(): Promise<Project[]> {
  const res = await fetch("/api/projects");
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}
