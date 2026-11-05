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
import { substationSchema, type SubstationValues } from "@/lib/validations";
import { createSubstation, updateSubstation } from "@/services/substations";
import type { OperationalStatus, Substation, Zone } from "@/types";

const statusOptions = Object.entries(OPERATIONAL_STATUS).map(([value, s]) => ({ value, label: s.label }));

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  substation?: Substation;
  zones: Zone[];
  onSaved: () => void;
}

export function SubstationFormDialog({ open, onOpenChange, substation, zones, onSaved }: Props) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={substation ? "Edit substation" : "Add substation"}>
      <SubstationForm substation={substation} zones={zones} onDone={() => { onOpenChange(false); onSaved(); }} />
    </FormDialog>
  );
}

function SubstationForm({ substation, zones, onDone }: { substation?: Substation; zones: Zone[]; onDone: () => void }) {
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<SubstationValues>({
    resolver: zodResolver(substationSchema),
    defaultValues: substation
      ? { name: substation.name, code: substation.code, zoneId: substation.zoneId, capacityMVA: substation.capacityMVA, status: substation.status }
      : { name: "", code: "", zoneId: "", status: "OPERATIONAL" },
  });

  async function onSubmit(values: SubstationValues) {
    try {
      if (substation) await updateSubstation(substation.id, values);
      else await createSubstation(values);
      toast.success(substation ? "Substation updated." : "Substation added.");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the substation.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Substation name" htmlFor="sub-name" error={errors.name?.message}>
          <Input id="sub-name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Substation code" htmlFor="sub-code" error={errors.code?.message} hint="For example SS-MIR">
          <Input id="sub-code" aria-invalid={!!errors.code} {...register("code")} />
        </FormField>
      </div>
      <FormField label="Distribution zone" htmlFor="sub-zone" error={errors.zoneId?.message}>
        <Controller name="zoneId" control={control} render={({ field }) => (
          <SimpleSelect id="sub-zone" value={field.value} onChange={field.onChange} placeholder="Choose a zone"
            invalid={!!errors.zoneId} options={zones.map((z) => ({ value: z.id, label: z.name }))} />
        )} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Capacity (MVA)" htmlFor="sub-cap" error={errors.capacityMVA?.message}>
          <Input id="sub-cap" type="number" step="any" aria-invalid={!!errors.capacityMVA} {...register("capacityMVA", { valueAsNumber: true })} />
        </FormField>
        <FormField label="Status" htmlFor="sub-status" error={errors.status?.message}>
          <Controller name="status" control={control} render={({ field }) => (
            <SimpleSelect id="sub-status" value={field.value} onChange={(v) => field.onChange(v as OperationalStatus)} options={statusOptions} />
          )} />
        </FormField>
      </div>
      <Button type="submit" className="h-9 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : substation ? "Save changes" : "Add substation"}
      </Button>
    </form>
  );
}
