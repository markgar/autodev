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

function DesktopTable({ projects, navigate }: { projects: Project[]; navigate: (path: string) => void }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-muted-foreground">
          <th className="text-left py-2 pr-4 font-medium">Name</th>
          <th className="text-left py-2 font-medium">Created</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((p) => (
          <tr
            key={p.id}
            role="button"
            tabIndex={0}
            onClick={() => navigate(`/projects/${p.id}`)}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/projects/${p.id}`)}
            className="border-b cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <td className="py-3 pr-4 font-medium" data-testid="project-name">{p.name}</td>
            <td className="py-3 text-muted-foreground">{formatDate(p.createdAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MobileCardList({ projects, navigate }: { projects: Project[]; navigate: (path: string) => void }) {
  return (
    <div className="space-y-2">
      {projects.map((p) => (
        <div
          key={p.id}
          role="button"
          tabIndex={0}
          onClick={() => navigate(`/projects/${p.id}`)}
          onKeyDown={(e) => e.key === "Enter" && navigate(`/projects/${p.id}`)}
          className="min-h-[44px] flex flex-col justify-center px-4 py-3 rounded-md border cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <p className="font-bold">{p.name}</p>
          <p className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</p>
        </div>
      ))}
    </div>
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

  const sortedProjects = projects
    ? [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => navigate("/projects/new")}>New Project</Button>
      </div>

      {loading && <ProjectSkeleton />}

      {!loading && error && (
        <div className="space-y-3">
          <p className="text-destructive">Failed to load projects</p>
          <Button variant="outline" onClick={load}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && sortedProjects && (
        <div className="space-y-2">
          {sortedProjects.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12 text-center">
              <p className="text-muted-foreground">No projects yet</p>
              <Button onClick={() => navigate("/projects/new")}>
                Create your first project
              </Button>
            </div>
          ) : (
            <>
              <div className="hidden md:block">
                <DesktopTable projects={sortedProjects} navigate={navigate} />
              </div>
              <div className="block md:hidden">
                <MobileCardList projects={sortedProjects} navigate={navigate} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
