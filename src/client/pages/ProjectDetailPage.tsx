import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchProject, fetchProjectLogs, formatDate } from "@/lib/api";
import type { Project } from "../../shared/types";

const POLL_INTERVAL_MS = 7000;

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [lines, setLines] = useState<string[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

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
      .catch((err: Error) => {
        if (err.message === "Project not found") {
          setNotFound(true);
        } else {
          setProjectError(err.message);
        }
        setProjectLoading(false);
      });
  }

  function loadLogs() {
    if (!id) return;
    fetchProjectLogs(id)
      .then((data) => {
        setLines(data);
        setLogsLoading(false);
        setLogsError(null);
      })
      .catch((err: Error) => {
        setLogsError(err.message);
        setLogsLoading(false);
      });
  }

  useEffect(() => {
    loadProject();
  }, [id]);

  useEffect(() => {
    loadLogs();
  }, [id]);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(() => {
      if (!id) return;
      fetchProjectLogs(id)
        .then((data) => {
          setLines(data);
          setLogsError(null);
        })
        .catch((err: Error) => {
          setLogsError(err.message);
        });
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [id, polling]);

  useEffect(() => {
    if (!autoScroll || !scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines, autoScroll]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function handleScroll() {
      if (!el) return;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      setAutoScroll(atBottom);
    }
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin h-6 w-6 text-muted-foreground" />
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
        <h1 className="text-2xl font-bold">{project?.name}</h1>
        <p className="text-sm text-muted-foreground">
          {project ? formatDate(project.createdAt) : ""}
        </p>
      </div>

      <div
        ref={scrollRef}
        className="relative bg-zinc-900 text-zinc-100 rounded-lg border font-mono text-xs md:text-sm p-4 overflow-y-auto h-[calc(100vh-12rem)]"
      >
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${polling ? "bg-green-500 animate-pulse" : "bg-zinc-500"}`}
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-zinc-100 hover:text-white hover:bg-zinc-700"
            onClick={() => setPolling((p) => !p)}
          >
            {polling ? (
              <>
                <Pause className="h-3 w-3 mr-1" /> Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3 mr-1" /> Resume
              </>
            )}
          </Button>
        </div>

        {logsLoading && (
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Loading logs…</span>
          </div>
        )}

        {!logsLoading && logsError && (
          <div className="space-y-2">
            <p className="text-red-400">Could not load logs</p>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-zinc-100 hover:text-white hover:bg-zinc-700"
              onClick={() => {
                setLogsLoading(true);
                loadLogs();
              }}
            >
              Retry
            </Button>
          </div>
        )}

        {!logsLoading && !logsError && lines.length === 0 && (
          <p className="text-zinc-400">
            No logs yet — logs will appear here when a build runs.
          </p>
        )}

        {!logsLoading && !logsError && lines.length > 0 && (
          <div>
            {lines.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap break-all">
                {line}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
