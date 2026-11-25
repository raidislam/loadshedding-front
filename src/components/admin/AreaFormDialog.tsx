"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOptions } from "@/hooks/useApi";
import { api, errorMessage } from "@/lib/api";
import { areaSchema, type AreaValues } from "@/lib/validations";
import type { Area, Feeder, Substation, Zone } from "@/types/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  area?: Area;
}

export function AreaFormDialog({ open, onOpenChange, area }: Props) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={area ? "Edit area" : "Add area"}>
      <AreaForm area={area} onDone={() => onOpenChange(false)} />
    </FormDialog>
  );
}

function AreaForm({ area, onDone }: { area?: Area; onDone: () => void }) {
  const queryClient = useQueryClient();
  const { data: zones = [] } = useOptions<Zone>("zones", { sortBy: "name", sortOrder: "asc" });
  const { data: substations = [] } = useOptions<Substation>("substations", { sortBy: "name", sortOrder: "asc" });
  const { data: feeders = [] } = useOptions<Feeder>("feeders", { sortBy: "name", sortOrder: "asc" });

  const { register, control, setValue, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(areaSchema),
    defaultValues: {
      name: area?.name ?? "",
      code: area?.code ?? "",
      zoneId: area?.feeder.substation.zone.id ?? "",
      substationId: area?.feeder.substation.id ?? "",
      feederId: area?.feederId ?? "",
    },
  });

  // Zone -> Substation -> Feeder: each dropdown only shows items under the one above it
  const zoneId = useWatch({ control, name: "zoneId" });
  const substationId = useWatch({ control, name: "substationId" });
  const substationOptions = substations
    .filter((s) => s.zoneId === zoneId)
    .map((s) => ({ value: s.id, label: s.name }));
  const feederOptions = feeders
    .filter((f) => f.substationId === substationId)
    .map((f) => ({ value: f.id, label: `${f.name} (${f.code})` }));

  const save = useMutation({
    mutationFn: (v: AreaValues) => {
      const body = { name: v.name, code: v.code, feederId: v.feederId };
      return area ? api(`/areas/${area.id}`, { method: "PATCH", body }) : api("/areas", { method: "POST", body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["areas"] });
      queryClient.invalidateQueries({ queryKey: ["feeders"] }); // area counts change
      toast.success(area ? "Area updated." : "Area added.");
      onDone();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Area name" htmlFor="area-name" error={errors.name?.message}>
          <Input id="area-name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Area code" htmlFor="area-code" error={errors.code?.message} hint="For example UTT-7">
          <Input id="area-code" className="uppercase" aria-invalid={!!errors.code} {...register("code")} />
        </FormField>
      </div>
      <FormField label="Distribution zone" htmlFor="area-zone">
        <Controller
          name="zoneId"
          control={control}
          render={({ field }) => (
            <SimpleSelect
              id="area-zone"
              value={field.value}
              placeholder="Choose a zone"
              options={zones.map((z) => ({ value: z.id, label: z.name }))}
              onChange={(v) => {
                field.onChange(v);
                setValue("substationId", "");
                setValue("feederId", "");
              }}
            />
          )}
        />
      </FormField>
      <FormField label="Substation" htmlFor="area-sub">
        <Controller
          name="substationId"
          control={control}
          render={({ field }) => (
            <SimpleSelect
              id="area-sub"
              value={field.value}
              disabled={!zoneId}
              placeholder={zoneId ? "Choose a substation" : "Choose a zone first"}
              options={substationOptions}
              onChange={(v) => {
                field.onChange(v);
                setValue("feederId", "");
              }}
            />
          )}
        />
      </FormField>
      <FormField label="Feeder" htmlFor="area-fdr" error={errors.feederId?.message}>
        <Controller
          name="feederId"
          control={control}
          render={({ field }) => (
            <SimpleSelect
              id="area-fdr"
              value={field.value}
              disabled={!substationId}
              invalid={!!errors.feederId}
              placeholder={substationId ? "Choose a feeder" : "Choose a substation first"}
              options={feederOptions}
              onChange={field.onChange}
            />
          )}
        />
      </FormField>
      <Button type="submit" className="h-9 w-full" disabled={save.isPending}>
        {save.isPending ? "Saving..." : area ? "Save changes" : "Add area"}
      </Button>
    </form>
  );
}
