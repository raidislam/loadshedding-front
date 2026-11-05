"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OPERATIONAL_STATUS } from "@/constants/statuses";
import { feederSchema, type FeederValues } from "@/lib/validations";
import { createFeeder, updateFeeder } from "@/services/feeders";
import type { Feeder, OperationalStatus, Substation } from "@/types";

const statusOptions = Object.entries(OPERATIONAL_STATUS).map(([value, s]) => ({ value, label: s.label }));

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeder?: Feeder;
  substations: Substation[];
  onSaved: () => void;
}

export function FeederFormDialog({ open, onOpenChange, feeder, substations, onSaved }: Props) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={feeder ? "Edit feeder" : "Add feeder"}>
      <FeederForm feeder={feeder} substations={substations} onDone={() => { onOpenChange(false); onSaved(); }} />
    </FormDialog>
  );
}

function FeederForm({ feeder, substations, onDone }: { feeder?: Feeder; substations: Substation[]; onDone: () => void }) {
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FeederValues>({
    resolver: zodResolver(feederSchema),
    defaultValues: feeder
      ? { code: feeder.code, substationId: feeder.substationId, capacityMW: feeder.capacityMW, status: feeder.status }
      : { code: "", substationId: "", status: "OPERATIONAL" },
  });

  async function onSubmit(values: FeederValues) {
    try {
      if (feeder) await updateFeeder(feeder.id, values);
      else await createFeeder(values);
      toast.success(feeder ? "Feeder updated." : "Feeder added.");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the feeder.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Feeder code" htmlFor="fdr-code" error={errors.code?.message} hint="For example MIR-03">
        <Input id="fdr-code" aria-invalid={!!errors.code} {...register("code")} />
      </FormField>
      <FormField label="Connected substation" htmlFor="fdr-sub" error={errors.substationId?.message}>
        <Controller name="substationId" control={control} render={({ field }) => (
          <SimpleSelect id="fdr-sub" value={field.value} onChange={field.onChange} placeholder="Choose a substation"
            invalid={!!errors.substationId} options={substations.map((s) => ({ value: s.id, label: s.name }))} />
        )} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Capacity (MW)" htmlFor="fdr-cap" error={errors.capacityMW?.message}>
          <Input id="fdr-cap" type="number" step="any" aria-invalid={!!errors.capacityMW} {...register("capacityMW", { valueAsNumber: true })} />
        </FormField>
        <FormField label="Status" htmlFor="fdr-status" error={errors.status?.message}>
          <Controller name="status" control={control} render={({ field }) => (
            <SimpleSelect id="fdr-status" value={field.value} onChange={(v) => field.onChange(v as OperationalStatus)} options={statusOptions} />
          )} />
        </FormField>
      </div>
      <Button type="submit" className="h-9 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : feeder ? "Save changes" : "Add feeder"}
      </Button>
    </form>
  );
}
