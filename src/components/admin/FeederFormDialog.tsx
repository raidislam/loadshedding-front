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
import { feederSchema, type FeederValues } from "@/lib/validations";
import type { Feeder, Substation, Zone } from "@/types/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feeder?: Feeder;
}

export function FeederFormDialog({ open, onOpenChange, feeder }: Props) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={feeder ? "Edit feeder" : "Add feeder"}>
      <FeederForm feeder={feeder} onDone={() => onOpenChange(false)} />
    </FormDialog>
  );
}

function FeederForm({ feeder, onDone }: { feeder?: Feeder; onDone: () => void }) {
  const queryClient = useQueryClient();
  const { data: zones = [] } = useOptions<Zone>("zones", { sortBy: "name", sortOrder: "asc" });
  const { data: substations = [] } = useOptions<Substation>("substations", { sortBy: "name", sortOrder: "asc" });

  const { register, control, setValue, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(feederSchema),
    defaultValues: {
      name: feeder?.name ?? "",
      code: feeder?.code ?? "",
      zoneId: feeder?.substation?.zone.id ?? "",
      substationId: feeder?.substationId ?? "",
      voltageKV: feeder?.voltageKV ? String(feeder.voltageKV) : "",
    },
  });

  // Zone -> Substation: the substation list only shows the chosen zone's substations
  const zoneId = useWatch({ control, name: "zoneId" });
  const substationOptions = substations
    .filter((s) => !zoneId || s.zoneId === zoneId)
    .map((s) => ({ value: s.id, label: `${s.name} (${s.code})` }));

  const save = useMutation({
    mutationFn: (v: FeederValues) => {
      const body = {
        name: v.name,
        code: v.code,
        substationId: v.substationId,
        ...(v.voltageKV ? { voltageKV: Number(v.voltageKV) } : {}),
      };
      return feeder ? api(`/feeders/${feeder.id}`, { method: "PATCH", body }) : api("/feeders", { method: "POST", body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeders"] });
      queryClient.invalidateQueries({ queryKey: ["substations"] }); // feeder counts change
      toast.success(feeder ? "Feeder updated." : "Feeder added.");
      onDone();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Feeder name" htmlFor="fd-name" error={errors.name?.message}>
          <Input id="fd-name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Code" htmlFor="fd-code" error={errors.code?.message} hint="For example FD-11">
          <Input id="fd-code" className="uppercase" aria-invalid={!!errors.code} {...register("code")} />
        </FormField>
      </div>
      <FormField label="Distribution zone" htmlFor="fd-zone" hint="Filters the substation list">
        <Controller
          name="zoneId"
          control={control}
          render={({ field }) => (
            <SimpleSelect
              id="fd-zone"
              value={field.value}
              placeholder="All zones"
              options={zones.map((z) => ({ value: z.id, label: z.name }))}
              onChange={(v) => {
                field.onChange(v);
                setValue("substationId", "");
              }}
            />
          )}
        />
      </FormField>
      <FormField label="Substation" htmlFor="fd-sub" error={errors.substationId?.message}>
        <Controller
          name="substationId"
          control={control}
          render={({ field }) => (
            <SimpleSelect
              id="fd-sub"
              value={field.value}
              onChange={field.onChange}
              placeholder="Choose a substation"
              invalid={!!errors.substationId}
              options={substationOptions}
            />
          )}
        />
      </FormField>
      <FormField label="Voltage in kV (optional)" htmlFor="fd-kv" error={errors.voltageKV?.message}>
        <Input id="fd-kv" inputMode="decimal" placeholder="11" aria-invalid={!!errors.voltageKV} {...register("voltageKV")} />
      </FormField>
      <Button type="submit" className="h-9 w-full" disabled={save.isPending}>
        {save.isPending ? "Saving..." : feeder ? "Save changes" : "Add feeder"}
      </Button>
    </form>
  );
}
