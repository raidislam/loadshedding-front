"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { areaSchema, type AreaValues } from "@/lib/validations";
import { createArea, updateArea } from "@/services/areas";
import type { Area, Feeder, Substation, Zone } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area?: Area;
  zones: Zone[];
  substations: Substation[];
  feeders: Feeder[];
  onSaved: () => void;
}

export function AreaFormDialog({ open, onOpenChange, area, zones, substations, feeders, onSaved }: Props) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={area ? "Edit area" : "Add area"}>
      <AreaForm area={area} zones={zones} substations={substations} feeders={feeders}
        onDone={() => { onOpenChange(false); onSaved(); }} />
    </FormDialog>
  );
}

interface FormProps {
  area?: Area;
  zones: Zone[];
  substations: Substation[];
  feeders: Feeder[];
  onDone: () => void;
}

function AreaForm({ area, zones, substations, feeders, onDone }: FormProps) {
  const { register, control, setValue, handleSubmit, formState: { errors, isSubmitting } } = useForm<AreaValues>({
    resolver: zodResolver(areaSchema),
    defaultValues: area
      ? { name: area.name, code: area.code, zoneId: area.zoneId, substationId: area.substationId, feederId: area.feederId, customerCount: area.customerCount }
      : { name: "", code: "", zoneId: "", substationId: "", feederId: "" },
  });

  // Zone -> Substation -> Feeder: each dropdown only shows items that belong to the one above.
  const zoneId = useWatch({ control, name: "zoneId" });
  const substationId = useWatch({ control, name: "substationId" });
  const substationOptions = substations.filter((s) => s.zoneId === zoneId).map((s) => ({ value: s.id, label: s.name }));
  const feederOptions = feeders.filter((f) => f.substationId === substationId).map((f) => ({ value: f.id, label: f.code }));

  async function onSubmit(values: AreaValues) {
    try {
      if (area) await updateArea(area.id, values);
      else await createArea(values);
      toast.success(area ? "Area updated." : "Area added.");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the area.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Area name" htmlFor="area-name" error={errors.name?.message}>
          <Input id="area-name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Area code" htmlFor="area-code" error={errors.code?.message} hint="For example MIR-12">
          <Input id="area-code" aria-invalid={!!errors.code} {...register("code")} />
        </FormField>
      </div>
      <FormField label="Distribution zone" htmlFor="area-zone" error={errors.zoneId?.message}>
        <Controller name="zoneId" control={control} render={({ field }) => (
          <SimpleSelect id="area-zone" value={field.value} placeholder="Choose a zone" invalid={!!errors.zoneId}
            options={zones.map((z) => ({ value: z.id, label: z.name }))}
            onChange={(v) => { field.onChange(v); setValue("substationId", ""); setValue("feederId", ""); }} />
        )} />
      </FormField>
      <FormField label="Substation" htmlFor="area-sub" error={errors.substationId?.message}>
        <Controller name="substationId" control={control} render={({ field }) => (
          <SimpleSelect id="area-sub" value={field.value} disabled={!zoneId} invalid={!!errors.substationId}
            placeholder={zoneId ? "Choose a substation" : "Choose a zone first"} options={substationOptions}
            onChange={(v) => { field.onChange(v); setValue("feederId", ""); }} />
        )} />
      </FormField>
      <FormField label="Feeder" htmlFor="area-fdr" error={errors.feederId?.message}>
        <Controller name="feederId" control={control} render={({ field }) => (
          <SimpleSelect id="area-fdr" value={field.value} disabled={!substationId} invalid={!!errors.feederId}
            placeholder={substationId ? "Choose a feeder" : "Choose a substation first"} options={feederOptions}
            onChange={field.onChange} />
        )} />
      </FormField>
      <FormField label="Customer count" htmlFor="area-cust" error={errors.customerCount?.message}>
        <Input id="area-cust" type="number" aria-invalid={!!errors.customerCount} {...register("customerCount", { valueAsNumber: true })} />
      </FormField>
      <Button type="submit" className="h-9 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : area ? "Save changes" : "Add area"}
      </Button>
    </form>
  );
}
