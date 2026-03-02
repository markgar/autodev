import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { fetchSampleSpecs } from "@/lib/api";
import type { SampleSpec } from "../../shared/types";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  specName: z.string().min(1, "Please select a spec"),
});

type FormValues = z.infer<typeof schema>;

export function NewProjectPage() {
  const [specs, setSpecs] = useState<SampleSpec[]>([]);
  const [specsLoading, setSpecsLoading] = useState(true);
  const [specsError, setSpecsError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", specName: "" },
  });

  useEffect(() => {
    fetchSampleSpecs()
      .then((data) => {
        setSpecs(data);
        setSpecsLoading(false);
      })
      .catch((err: Error) => {
        setSpecsError(err.message);
        setSpecsLoading(false);
      });
  }, []);

  return <div>{/* form rendered in subsequent steps */}</div>;
}
