import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Eye, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  deleteSampleSpec,
  fetchSampleSpecContent,
  fetchSampleSpecs,
  uploadSampleSpec,
} from "@/lib/api";
import { formatDate } from "@/lib/api";
import { formatFileSize } from "@/lib/utils";
import type { SampleSpec } from "../../shared/types";

function SpecsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

function DesktopTable({
  specs,
  deletingSet,
  onView,
  onDeleteConfirm,
}: {
  specs: SampleSpec[];
  deletingSet: Set<string>;
  onView: (name: string) => void;
  onDeleteConfirm: (name: string) => void;
}) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-muted-foreground">
          <th className="text-left py-2 pr-4 font-medium">Filename</th>
          <th className="text-left py-2 pr-4 font-medium">Size</th>
          <th className="text-left py-2 pr-4 font-medium">Last Modified</th>
          <th className="text-left py-2 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {specs.map((s) => (
          <tr key={s.name} className="border-b hover:bg-accent">
            <td className="py-3 pr-4 font-medium">{s.name}</td>
            <td className="py-3 pr-4 text-muted-foreground">{formatFileSize(s.size)}</td>
            <td className="py-3 pr-4 text-muted-foreground">{formatDate(s.lastModified)}</td>
            <td className="py-3">
              <RowActions
                name={s.name}
                deleting={deletingSet.has(s.name)}
                onView={onView}
                onDeleteConfirm={onDeleteConfirm}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MobileCardList({
  specs,
  deletingSet,
  onView,
  onDeleteConfirm,
}: {
  specs: SampleSpec[];
  deletingSet: Set<string>;
  onView: (name: string) => void;
  onDeleteConfirm: (name: string) => void;
}) {
  return (
    <div className="space-y-2">
      {specs.map((s) => (
        <div key={s.name} className="rounded-md border p-4 space-y-2">
          <p className="font-bold">{s.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(s.size)} · {formatDate(s.lastModified)}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="min-h-[44px] min-w-[44px]"
              onClick={() => onView(s.name)}
              aria-label={`View ${s.name}`}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <DeleteButton
              name={s.name}
              deleting={deletingSet.has(s.name)}
              onDeleteConfirm={onDeleteConfirm}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DeleteButton({
  name,
  deleting,
  onDeleteConfirm,
}: {
  name: string;
  deleting: boolean;
  onDeleteConfirm: (name: string) => void;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="min-h-[44px] min-w-[44px]"
          disabled={deleting}
          aria-label={`Delete ${name}`}
        >
          {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Delete {name}? This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onDeleteConfirm(name)}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function RowActions({
  name,
  deleting,
  onView,
  onDeleteConfirm,
}: {
  name: string;
  deleting: boolean;
  onView: (name: string) => void;
  onDeleteConfirm: (name: string) => void;
}) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onView(name)}
        aria-label={`View ${name}`}
      >
        <Eye className="h-4 w-4" />
      </Button>
      <DeleteButton name={name} deleting={deleting} onDeleteConfirm={onDeleteConfirm} />
    </div>
  );
}

function ViewModal({
  name,
  content,
  open,
  onClose,
}: {
  name: string;
  content: string;
  open: boolean;
  onClose: () => void;
}) {
  function handleDownload() {
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        <pre className="font-mono text-sm overflow-y-auto max-h-[70vh] whitespace-pre-wrap break-all">
          {content}
        </pre>
        <DialogFooter>
          <Button variant="outline" onClick={handleDownload}>
            Download
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SampleSpecsAdminPage() {
  const [specs, setSpecs] = useState<SampleSpec[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingSet, setDeletingSet] = useState<Set<string>>(new Set());
  const [viewModal, setViewModal] = useState<{ name: string; content: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadSpecs() {
    setLoading(true);
    setError(null);
    fetchSampleSpecs()
      .then((data) => {
        setSpecs(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
        toast.error(`Failed to load specs: ${err.message}`);
      });
  }

  useEffect(() => {
    loadSpecs();
  }, []);

  async function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      try {
        await uploadSampleSpec(file);
        toast.success(`Uploaded ${file.name}`);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}: ${(err as Error).message}`);
      }
    }
    setUploading(false);
    e.target.value = "";
    loadSpecs();
  }

  async function handleView(name: string) {
    try {
      const result = await fetchSampleSpecContent(name);
      setViewModal({ name: result.name, content: result.content });
    } catch (err) {
      toast.error(`Failed to load ${name}: ${(err as Error).message}`);
    }
  }

  async function handleDeleteConfirm(name: string) {
    setDeletingSet((prev) => new Set(prev).add(name));
    try {
      await deleteSampleSpec(name);
      toast.success(`Deleted ${name}`);
    } catch (err) {
      toast.error(`Failed to delete ${name}: ${(err as Error).message}`);
    } finally {
      setDeletingSet((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
    }
    loadSpecs();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sample Specs</h1>
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".md"
          multiple
          className="hidden"
          onChange={handleFilesSelected}
        />
      </div>

      {loading && <SpecsSkeleton />}

      {!loading && error && (
        <div className="space-y-3">
          <p className="text-destructive">Failed to load specs</p>
          <Button variant="outline" onClick={loadSpecs}>
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && specs && (
        <div className="space-y-2">
          {specs.length === 0 ? (
            <p className="text-muted-foreground">
              No sample specs uploaded yet. Click Upload to add your first spec.
            </p>
          ) : (
            <>
              <div className="hidden md:block">
                <DesktopTable
                  specs={specs}
                  deletingSet={deletingSet}
                  onView={handleView}
                  onDeleteConfirm={handleDeleteConfirm}
                />
              </div>
              <div className="block md:hidden">
                <MobileCardList
                  specs={specs}
                  deletingSet={deletingSet}
                  onView={handleView}
                  onDeleteConfirm={handleDeleteConfirm}
                />
              </div>
            </>
          )}
        </div>
      )}

      {viewModal && (
        <ViewModal
          name={viewModal.name}
          content={viewModal.content}
          open={true}
          onClose={() => setViewModal(null)}
        />
      )}
    </div>
  );
}
