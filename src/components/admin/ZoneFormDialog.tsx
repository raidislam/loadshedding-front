"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OPERATIONAL_STATUS } from "@/constants/statuses";
import { zoneSchema, type ZoneValues } from "@/lib/validations";
import { createZone, updateZone } from "@/services/zones";
import type { OperationalStatus, Zone } from "@/types";

const statusOptions = Object.entries(OPERATIONAL_STATUS).map(([value, s]) => ({ value, label: s.label }));

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone?: Zone; // set = edit, empty = add
  onSaved: () => void;
}

export function ZoneFormDialog({ open, onOpenChange, zone, onSaved }: Props) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={zone ? "Edit distribution zone" : "Add distribution zone"}>
      <ZoneForm zone={zone} onDone={() => { onOpenChange(false); onSaved(); }} />
    </FormDialog>
  );
}

function ZoneForm({ zone, onDone }: { zone?: Zone; onDone: () => void }) {
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ZoneValues>({
    resolver: zodResolver(zoneSchema),
    defaultValues: zone
      ? { name: zone.name, code: zone.code, description: zone.description, status: zone.status }
      : { name: "", code: "", description: "", status: "OPERATIONAL" },
  });

  async function onSubmit(values: ZoneValues) {
    try {
      if (zone) await updateZone(zone.id, values);
      else await createZone(values);
      toast.success(zone ? "Zone updated." : "Zone added.");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the zone.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Zone name" htmlFor="zone-name" error={errors.name?.message}>
          <Input id="zone-name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Zone code" htmlFor="zone-code" error={errors.code?.message} hint="For example DN or CTG">
          <Input id="zone-code" aria-invalid={!!errors.code} {...register("code")} />
        </FormField>
      </div>
      <FormField label="Description" htmlFor="zone-desc" error={errors.description?.message}>
        <Textarea id="zone-desc" rows={3} aria-invalid={!!errors.description} {...register("description")} />
      </FormField>
      <FormField label="Status" htmlFor="zone-status" error={errors.status?.message}>
        <Controller name="status" control={control} render={({ field }) => (
          <SimpleSelect id="zone-status" value={field.value} onChange={(v) => field.onChange(v as OperationalStatus)} options={statusOptions} />
        )} />
      </FormField>
      <Button type="submit" className="h-9 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : zone ? "Save changes" : "Add zone"}
      </Button>
    </form>
  );
}
