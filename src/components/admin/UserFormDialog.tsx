"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, errorMessage } from "@/lib/api";
import { technicianSchema, type TechnicianValues } from "@/lib/validations";
import type { User } from "@/types/api";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Admins can only create TECHNICIAN accounts. Customers register themselves,
// and an existing user can be made an admin with "Change role".
export function UserFormDialog({ open, onOpenChange }: Props) {
  return (
    <FormDialog open={open} onOpenChange={onOpenChange} title="Add technician" description="Create a login for a field technician. Share the password with them.">
      <TechnicianForm onDone={() => onOpenChange(false)} />
    </FormDialog>
  );
}

function TechnicianForm({ onDone }: { onDone: () => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<TechnicianValues>({
    resolver: zodResolver(technicianSchema),
    defaultValues: { name: "", email: "", password: "", phone: "", address: "" },
  });

  // POST /admin/users/technicians - empty optional fields are not sent
  const create = useMutation({
    mutationFn: (v: TechnicianValues) =>
      api<User>("/admin/users/technicians", {
        method: "POST",
        body: { name: v.name, email: v.email, password: v.password, phone: v.phone || undefined, address: v.address || undefined },
      }),
    onSuccess: (res) => {
      toast.success(`Technician account created for ${res.data.name}.`);
      queryClient.invalidateQueries({ queryKey: ["admin/users"] });
      onDone();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((v) => create.mutate(v))} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" htmlFor="t-name" error={errors.name?.message}>
          <Input id="t-name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Mobile number (optional)" htmlFor="t-phone" error={errors.phone?.message}>
          <Input id="t-phone" type="tel" placeholder="01811-234567" aria-invalid={!!errors.phone} {...register("phone")} />
        </FormField>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Email" htmlFor="t-email" error={errors.email?.message}>
          <Input id="t-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
        <FormField label="Initial password" htmlFor="t-pass" error={errors.password?.message}>
          <Input id="t-pass" type="text" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
        </FormField>
      </div>
      <FormField label="Address (optional)" htmlFor="t-address" error={errors.address?.message}>
        <Input id="t-address" aria-invalid={!!errors.address} {...register("address")} />
      </FormField>
      <Button type="submit" className="h-9 w-full" disabled={create.isPending}>
        {create.isPending ? "Creating..." : "Create technician"}
      </Button>
    </form>
  );
}
