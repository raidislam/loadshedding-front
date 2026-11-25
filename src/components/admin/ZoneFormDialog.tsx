"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, errorMessage } from "@/lib/api";
import { zoneSchema, type ZoneValues } from "@/lib/validations";
import type { Zone } from "@/types/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: Zone; // set = edit, empty = add
}

export function ZoneFormDialog({ open, onOpenChange, zone }: Props) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={zone ? "Edit distribution zone" : "Add distribution zone"}>
      <ZoneForm zone={zone} onDone={() => onOpenChange(false)} />
    </FormDialog>
  );
}

function ZoneForm({ zone, onDone }: { zone?: Zone; onDone: () => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(zoneSchema),
    defaultValues: { name: zone?.name ?? "", code: zone?.code ?? "", description: zone?.description ?? "" },
  });

  // POST /zones (add) or PATCH /zones/:id (edit)
  const save = useMutation({
    mutationFn: (values: ZoneValues) => {
      const body = { name: values.name, code: values.code, ...(values.description ? { description: values.description } : {}) };
      return zone ? api(`/zones/${zone.id}`, { method: "PATCH", body }) : api("/zones", { method: "POST", body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["zones"] }); // refresh every zone list
      toast.success(zone ? "Zone updated." : "Zone added.");
      onDone();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((values) => save.mutate(values))} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Zone name" htmlFor="zone-name" error={errors.name?.message}>
          <Input id="zone-name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Zone code" htmlFor="zone-code" error={errors.code?.message} hint="For example DHK-N">
          <Input id="zone-code" className="uppercase" aria-invalid={!!errors.code} {...register("code")} />
        </FormField>
      </div>
      <FormField label="Description (optional)" htmlFor="zone-desc" error={errors.description?.message}>
        <Textarea id="zone-desc" rows={3} aria-invalid={!!errors.description} {...register("description")} />
      </FormField>
      <Button type="submit" className="h-9 w-full" disabled={save.isPending}>
        {save.isPending ? "Saving..." : zone ? "Save changes" : "Add zone"}
      </Button>
    </form>
  );
}
