export interface Project {
  id: string;
  organizationId: string;
  type: "project";
  name: string;
  specName: string;
  createdAt: string;
  latestRunStatus: "pending" | "running" | "succeeded" | "failed" | null;
  runCount: number;
}

export interface ApiError {
  error: string;
}

export interface SampleSpec {
  name: string;
  size: number;
  lastModified: string;
}
