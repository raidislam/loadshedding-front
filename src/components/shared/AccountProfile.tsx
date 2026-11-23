"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useAuth, useRequiredUser } from "@/components/layout/AuthProvider";
import { FormField } from "@/components/shared/FormField";
import { PageHeader } from "@/components/shared/PageHeader";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ROLE_LABEL } from "@/constants/navigation";
import { api, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordValues,
  type ProfileValues,
} from "@/lib/validations";
import type { Area, AreaPath, User } from "@/types/api";

// Profile page for every role: GET/PATCH /users/me and PATCH /users/me/change-password
export function AccountProfile({ title = "My Profile" }: { title?: string }) {
  const user = useRequiredUser();

  return (
    <>
      <PageHeader title={title} description="Your personal details and password." />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <ProfileCard user={user} />
          <PasswordCard />
        </div>
        <AccountCard user={user} />
      </div>
    </>
  );
}

function ProfileCard({ user }: { user: User }) {
  const { updateProfile } = useAuth();
  const isCustomer = user.role === "CUSTOMER";

  // Only customers choose a service area
  const { data: areas } = useQuery({
    queryKey: ["areas", "options"],
    queryFn: async () => (await api<Area[]>("/areas", { query: { limit: 100, sortBy: "name", sortOrder: "asc" } })).data,
    enabled: isCustomer,
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone ?? "",
      address: user.address ?? "",
      meterNumber: user.meterNumber ?? "",
      areaId: user.areaId ?? "",
    },
  });

  async function onSubmit(values: ProfileValues) {
    // Send only filled fields (the backend does not accept empty strings)
    const patch: Partial<ProfileValues> = { name: values.name };
    if (values.phone) patch.phone = values.phone;
    if (values.address) patch.address = values.address;
    if (isCustomer && values.meterNumber) patch.meterNumber = values.meterNumber;
    if (isCustomer && values.areaId) patch.areaId = values.areaId;

    try {
      const updated = await updateProfile(patch);
      reset({
        name: updated.name,
        phone: updated.phone ?? "",
        address: updated.address ?? "",
        meterNumber: updated.meterNumber ?? "",
        areaId: updated.areaId ?? "",
      });
      toast.success("Profile updated.");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal information</CardTitle>
        <CardDescription>Your email and role can&apos;t be changed here.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Full name" htmlFor="p-name" error={errors.name?.message}>
            <Input id="p-name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Mobile number" htmlFor="p-phone" error={errors.phone?.message}>
              <Input id="p-phone" type="tel" placeholder="01811-234567" aria-invalid={!!errors.phone} {...register("phone")} />
            </FormField>
            {isCustomer && (
              <FormField label="Meter number" htmlFor="p-meter" error={errors.meterNumber?.message}>
                <Input id="p-meter" placeholder="MTR-10001" aria-invalid={!!errors.meterNumber} {...register("meterNumber")} />
              </FormField>
            )}
          </div>
          <FormField label="Address" htmlFor="p-address" error={errors.address?.message}>
            <Input id="p-address" autoComplete="street-address" aria-invalid={!!errors.address} {...register("address")} />
          </FormField>
          {isCustomer && (
            <FormField
              label="Service area"
              htmlFor="p-area"
              error={errors.areaId?.message}
              hint="Scheduled outage notifications are sent for this area."
            >
              <Controller
                name="areaId"
                control={control}
                render={({ field }) => (
                  <SimpleSelect
                    id="p-area"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Choose your area"
                    options={(areas ?? []).map((a) => ({ value: a.id, label: `${a.name} (${a.feeder.substation.zone.name})` }))}
                  />
                )}
              />
            </FormField>
          )}
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordCard() {
  const router = useRouter();
  const { logout } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: ChangePasswordValues) {
    try {
      await api("/users/me/change-password", {
        method: "PATCH",
        body: { currentPassword: values.currentPassword, newPassword: values.newPassword },
      });
      // The backend ends every session after a password change
      await logout();
      toast.success("Password changed. Please log in with your new password.");
      router.replace("/login");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>You will be logged out and must log in again.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Current password" htmlFor="cp-current" error={errors.currentPassword?.message}>
            <Input id="cp-current" type="password" autoComplete="current-password" aria-invalid={!!errors.currentPassword} {...register("currentPassword")} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="New password" htmlFor="cp-new" error={errors.newPassword?.message} hint="8+ characters, with a letter and a number.">
              <Input id="cp-new" type="password" autoComplete="new-password" aria-invalid={!!errors.newPassword} {...register("newPassword")} />
            </FormField>
            <FormField label="Confirm new password" htmlFor="cp-confirm" error={errors.confirmPassword?.message}>
              <Input id="cp-confirm" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
            </FormField>
          </div>
          <Button type="submit" variant="outline" disabled={isSubmitting}>
            {isSubmitting ? "Changing..." : "Change password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AccountCard({ user }: { user: User }) {
  // /users/me returns the full path: area -> feeder -> substation -> zone
  const area = user.area && "feeder" in user.area ? (user.area as AreaPath) : null;

  return (
    <Card className="self-start lg:col-span-2">
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription>{user.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <dl className="space-y-3 text-sm">
          <Row label="Role" value={ROLE_LABEL[user.role]} />
          <Row label="Status" value={user.status === "ACTIVE" ? "Active" : "Blocked"} />
          {user.role === "CUSTOMER" && (
            <>
              <Row label="Service area" value={area?.name ?? "Not set"} />
              <Row label="Feeder" value={area?.feeder.name ?? "-"} />
              <Row label="Substation" value={area?.feeder.substation.name ?? "-"} />
              <Row label="Zone" value={area?.feeder.substation.zone.name ?? "-"} />
            </>
          )}
          <Row label="Member since" value={formatDate(user.createdAt)} />
        </dl>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
