import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchProjects, formatDate } from "@/lib/api";
import type { Project } from "../../shared/types";

function ProjectSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function ProjectRow({ project }: { project: Project }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/projects/${project.id}`)}
      className="w-full text-left flex items-center justify-between px-4 py-3 rounded-md border hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      <div>
        <p className="font-medium">{project.name}</p>
        <p className="text-sm text-muted-foreground">
          {project.specName} · {formatDate(project.createdAt)}
        </p>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          project.latestRunStatus === "succeeded"
            ? "bg-green-100 text-green-800"
            : project.latestRunStatus === "failed"
              ? "bg-red-100 text-red-800"
              : project.latestRunStatus === "running"
                ? "bg-blue-100 text-blue-800"
                : "bg-muted text-muted-foreground"
        }`}
      >
        {project.latestRunStatus ?? "no runs"}
      </span>
    </button>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError(null);
    fetchProjects()
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
        toast.error(`Failed to load projects: ${err.message}`);
      });
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => navigate("/projects/new")}>New Project</Button>
      </div>

      {loading && <ProjectSkeleton />}

      {!loading && error && (
        <div className="space-y-3">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && projects && (
        <div className="space-y-2">
          {projects.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No projects yet. Create one to get started.
            </p>
          ) : (
            projects.map((p) => <ProjectRow key={p.id} project={p} />)
          )}
        </div>
      )}
    </div>
  );
}
