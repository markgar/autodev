import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogViewer } from "@/components/LogViewer";
import { fetchProject, formatDate } from "@/lib/api";
import type { Project } from "../../shared/types";

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  function loadProject() {
    if (!id) return;
    setProjectLoading(true);
    setProjectError(null);
    setNotFound(false);
    fetchProject(id)
      .then((data) => {
        setProject(data);
        setProjectLoading(false);
      })
      .catch((err: Error & { status?: number }) => {
        if (err.status === 404) {
          setNotFound(true);
        } else {
          setProjectError(err.message);
        }
        setProjectLoading(false);
      });
  }

  useEffect(() => {
    loadProject();
  }, [id]);

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 role="status" aria-label="Loading" className="animate-spin h-6 w-6 text-muted-foreground" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="space-y-4">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← Back to Dashboard
        </Link>
        <p className="text-destructive">Project not found</p>
      </div>
    );
  }

  if (projectError) {
    return (
      <div className="space-y-3">
        <Link to="/" className="text-sm text-muted-foreground hover:underline">
          ← Back to Dashboard
        </Link>
        <p className="text-destructive">{projectError}</p>
        <Button variant="outline" onClick={loadProject}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        ← Back to Dashboard
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{project!.name}</h1>
        <p className="text-sm text-muted-foreground">
          {formatDate(project!.createdAt)}
        </p>
      </div>

      <LogViewer projectId={id!} />
    </div>
  );
}

