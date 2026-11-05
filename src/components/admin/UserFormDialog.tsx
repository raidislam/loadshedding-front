"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_LABEL } from "@/constants/navigation";
import { userSchema, type UserValues } from "@/lib/validations";
import { createUser } from "@/services/users";
import type { Area, Role, Zone } from "@/types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zones: Zone[];
  areas: Area[];
  onSaved: () => void;
}

export function UserFormDialog({ open, onOpenChange, zones, areas, onSaved }: Props) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Add user" description="Create an account for an admin, customer or technician.">
      <UserForm zones={zones} areas={areas} onDone={() => { onOpenChange(false); onSaved(); }} />
    </FormDialog>
  );
}

function UserForm({ zones, areas, onDone }: { zones: Zone[]; areas: Area[]; onDone: () => void }) {
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserValues>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", role: "TECHNICIAN", areaId: "", zoneId: "" },
  });
  const role = useWatch({ control, name: "role" });

  async function onSubmit(values: UserValues) {
    try {
      await createUser(values);
      toast.success("User created.");
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create the user.");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Role" htmlFor="u-role" error={errors.role?.message}>
        <Controller name="role" control={control} render={({ field }) => (
          <SimpleSelect id="u-role" value={field.value} onChange={(v) => field.onChange(v as Role)}
            options={Object.entries(ROLE_LABEL).map(([value, label]) => ({ value, label }))} />
        )} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" htmlFor="u-name" error={errors.name?.message}>
          <Input id="u-name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Mobile number" htmlFor="u-phone" error={errors.phone?.message}>
          <Input id="u-phone" type="tel" placeholder="01811-234567" aria-invalid={!!errors.phone} {...register("phone")} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="u-email" error={errors.email?.message}>
          <Input id="u-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
        <FormField label="Temporary password" htmlFor="u-pass" error={errors.password?.message}>
          <Input id="u-pass" type="text" aria-invalid={!!errors.password} {...register("password")} />
        </FormField>
      </div>
      {role === "TECHNICIAN" && (
        <FormField label="Assigned zone" htmlFor="u-zone" error={errors.zoneId?.message}>
          <Controller name="zoneId" control={control} render={({ field }) => (
            <SimpleSelect id="u-zone" value={field.value} onChange={field.onChange} placeholder="Choose a zone"
              invalid={!!errors.zoneId} options={zones.map((z) => ({ value: z.id, label: z.name }))} />
          )} />
        </FormField>
      )}
      {role === "CUSTOMER" && (
        <FormField label="Service area" htmlFor="u-area" error={errors.areaId?.message}>
          <Controller name="areaId" control={control} render={({ field }) => (
            <SimpleSelect id="u-area" value={field.value} onChange={field.onChange} placeholder="Choose an area"
              invalid={!!errors.areaId} options={areas.map((a) => ({ value: a.id, label: a.name }))} />
          )} />
        </FormField>
      )}
      <Button type="submit" className="h-9 w-full" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create user"}</Button>
    </form>
  );
}
