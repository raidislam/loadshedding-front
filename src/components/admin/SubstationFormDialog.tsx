"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOptions } from "@/hooks/useApi";
import { api, errorMessage } from "@/lib/api";
import { substationSchema, type SubstationValues } from "@/lib/validations";
import type { Substation, Zone } from "@/types/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  substation?: Substation;
}

export function SubstationFormDialog({ open, onOpenChange, substation }: Props) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title={substation ? "Edit substation" : "Add substation"}>
      <SubstationForm substation={substation} onDone={() => onOpenChange(false)} />
    </FormDialog>
  );
}

function SubstationForm({ substation, onDone }: { substation?: Substation; onDone: () => void }) {
  const queryClient = useQueryClient();
  const { data: zones = [] } = useOptions<Zone>("zones", { sortBy: "name", sortOrder: "asc" });

  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(substationSchema),
    defaultValues: {
      name: substation?.name ?? "",
      code: substation?.code ?? "",
      zoneId: substation?.zoneId ?? "",
      capacityMW: substation?.capacityMW ? String(substation.capacityMW) : "",
      address: substation?.address ?? "",
    },
  });

  const save = useMutation({
    mutationFn: (v: SubstationValues) => {
      const body = {
        name: v.name,
        code: v.code,
        zoneId: v.zoneId,
        ...(v.capacityMW ? { capacityMW: Number(v.capacityMW) } : {}),
        ...(v.address ? { address: v.address } : {}),
      };
      return substation
        ? api(`/substations/${substation.id}`, { method: "PATCH", body })
        : api("/substations", { method: "POST", body });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["substations"] });
      queryClient.invalidateQueries({ queryKey: ["zones"] }); // substation counts change
      toast.success(substation ? "Substation updated." : "Substation added.");
      onDone();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Substation name" htmlFor="ss-name" error={errors.name?.message}>
          <Input id="ss-name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Code" htmlFor="ss-code" error={errors.code?.message} hint="For example SS-UTT">
          <Input id="ss-code" className="uppercase" aria-invalid={!!errors.code} {...register("code")} />
        </FormField>
      </div>
      <FormField label="Distribution zone" htmlFor="ss-zone" error={errors.zoneId?.message}>
        <Controller
          name="zoneId"
          control={control}
          render={({ field }) => (
            <SimpleSelect
              id="ss-zone"
              value={field.value}
              onChange={field.onChange}
              placeholder="Choose a zone"
              invalid={!!errors.zoneId}
              options={zones.map((z) => ({ value: z.id, label: `${z.name} (${z.code})` }))}
            />
          )}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Capacity in MW (optional)" htmlFor="ss-cap" error={errors.capacityMW?.message}>
          <Input id="ss-cap" inputMode="decimal" aria-invalid={!!errors.capacityMW} {...register("capacityMW")} />
        </FormField>
        <FormField label="Address (optional)" htmlFor="ss-addr" error={errors.address?.message}>
          <Input id="ss-addr" aria-invalid={!!errors.address} {...register("address")} />
        </FormField>
      </div>
      <Button type="submit" className="h-9 w-full" disabled={save.isPending}>
        {save.isPending ? "Saving..." : substation ? "Save changes" : "Add substation"}
      </Button>
    </form>
  );
}
