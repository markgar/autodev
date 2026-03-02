import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { fetchSampleSpecs, createProject } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SampleSpec } from "../../shared/types";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  specName: z.string().min(1, "Please select a spec"),
});

type FormValues = z.infer<typeof schema>;

function stripMd(filename: string): string {
  return filename.replace(/\.md$/i, "");
}

function SpecSelector({
  specs,
  specsLoading,
  specsError,
  value,
  onChange,
  onRetry,
}: {
  specs: SampleSpec[];
  specsLoading: boolean;
  specsError: string | null;
  value: string;
  onChange: (val: string) => void;
  onRetry: () => void;
}) {
  if (specsLoading) {
    return (
      <Select disabled>
        <SelectTrigger id="specName">
          <SelectValue placeholder="Loading specs…" />
        </SelectTrigger>
        <SelectContent />
      </Select>
    );
  }
  if (specsError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-destructive">Failed to load specs: {specsError}</p>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>Retry</Button>
      </div>
    );
  }
  if (specs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No specs available — upload specs in Admin first
      </p>
    );
  }
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id="specName">
        <SelectValue placeholder="Select a spec…" />
      </SelectTrigger>
      <SelectContent>
        {specs.map((s) => (
          <SelectItem key={s.name} value={s.name}>
            {stripMd(s.name)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function NewProjectPage() {
  const navigate = useNavigate();
  const [specs, setSpecs] = useState<SampleSpec[]>([]);
  const [specsLoading, setSpecsLoading] = useState(true);
  const [specsError, setSpecsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", specName: "" },
  });

  const specName = watch("specName");
  const specsEmpty = !specsLoading && specsError === null && specs.length === 0;

  function loadSpecs() {
    setSpecsLoading(true);
    setSpecsError(null);
    fetchSampleSpecs()
      .then((data) => { setSpecs(data); setSpecsLoading(false); })
      .catch((err: Error) => { setSpecsError(err.message); setSpecsLoading(false); });
  }

  useEffect(() => { loadSpecs(); }, []);

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const project = await createProject({ name: values.name, specName: values.specName });
      navigate(`/projects/${project.id}`);
    } catch (err: unknown) {
      toast.error((err instanceof Error ? err.message : "Failed to create project"));
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">New Project</h1>

      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input id="name" autoFocus {...register("name")} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="specName">Sample Spec</Label>
        <SpecSelector
          specs={specs}
          specsLoading={specsLoading}
          specsError={specsError}
          value={specName}
          onChange={(val) => setValue("specName", val, { shouldValidate: true })}
          onRetry={loadSpecs}
        />
        {errors.specName && <p className="text-sm text-destructive">{errors.specName.message}</p>}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting || specsEmpty}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Project
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate("/")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
