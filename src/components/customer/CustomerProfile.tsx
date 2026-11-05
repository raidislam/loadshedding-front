"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth, useRequiredUser } from "@/components/layout/AuthProvider";
import { FormField } from "@/components/shared/FormField";
import { PageHeader } from "@/components/shared/PageHeader";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLoad } from "@/hooks/useLoad";
import { formatDate, formatNumber } from "@/lib/format";
import { customerProfileSchema, type CustomerProfileValues } from "@/lib/validations";
import { getAreas } from "@/services/areas";
import { getFeeders } from "@/services/feeders";
import { getSubstations } from "@/services/substations";
import { getZones } from "@/services/zones";
import type { Area, Feeder, Substation, User, Zone } from "@/types";

async function loadNetwork() {
  const [areas, zones, substations, feeders] = await Promise.all([getAreas(), getZones(), getSubstations(), getFeeders()]);
  return { areas, zones, substations, feeders };
}

export function CustomerProfile() {
  const user = useRequiredUser();
  const { data, error } = useLoad(loadNetwork);

  if (error) return <p className="text-destructive">{error}</p>;
  if (!data) return <Skeleton className="h-96 w-full" />;
  return <ProfileForm user={user} {...data} />;
}

interface Props { user: User; areas: Area[]; zones: Zone[]; substations: Substation[]; feeders: Feeder[] }

function ProfileForm({ user, areas, zones, substations, feeders }: Props) {
  const { updateProfile } = useAuth();
  const { register, control, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<CustomerProfileValues>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: { name: user.name, phone: user.phone, address: user.address ?? "", areaId: user.areaId ?? "" },
  });

  // Details of the area that is saved on the account
  const area = areas.find((a) => a.id === user.areaId);
  const zone = zones.find((z) => z.id === area?.zoneId);
  const substation = substations.find((s) => s.id === area?.substationId);
  const feeder = feeders.find((f) => f.id === area?.feederId);

  async function onSubmit(values: CustomerProfileValues) {
    try {
      await updateProfile(values);
      toast.success("Profile updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update your profile.");
    }
  }

  return (
    <>
      <PageHeader title="My Profile" description="Your personal details and service area." />
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Personal information</CardTitle>
            <CardDescription>Your email and customer number cannot be changed.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Email" htmlFor="p-email"><Input id="p-email" value={user.email} disabled readOnly /></FormField>
                <FormField label="Customer number" htmlFor="p-number"><Input id="p-number" value={user.customerNumber ?? "-"} disabled readOnly /></FormField>
              </div>
              <FormField label="Full name" htmlFor="p-name" error={errors.name?.message}>
                <Input id="p-name" aria-invalid={!!errors.name} {...register("name")} />
              </FormField>
              <FormField label="Mobile number" htmlFor="p-phone" error={errors.phone?.message}>
                <Input id="p-phone" type="tel" aria-invalid={!!errors.phone} {...register("phone")} />
              </FormField>
              <FormField label="Address" htmlFor="p-address" error={errors.address?.message}>
                <Input id="p-address" aria-invalid={!!errors.address} {...register("address")} />
              </FormField>
              <FormField label="Service area" htmlFor="p-area" error={errors.areaId?.message} hint="Outage news and reports are matched to this area.">
                <Controller name="areaId" control={control} render={({ field }) => (
                  <SimpleSelect id="p-area" value={field.value} onChange={field.onChange} placeholder="Choose your area"
                    invalid={!!errors.areaId} options={areas.map((a) => ({ value: a.id, label: a.name }))} />
                )} />
              </FormField>
              <Button type="submit" disabled={isSubmitting || !isDirty}>{isSubmitting ? "Saving..." : "Save changes"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="self-start lg:col-span-2">
          <CardHeader>
            <CardTitle>Your electricity network</CardTitle>
            <CardDescription>Saved service area: {area?.name ?? "not set"}</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-muted-foreground">Zone</dt><dd className="font-medium">{zone?.name ?? "-"}</dd></div>
              <div><dt className="text-muted-foreground">Substation</dt><dd className="font-medium">{substation?.name ?? "-"}</dd></div>
              <div><dt className="text-muted-foreground">Feeder</dt><dd className="font-medium">{feeder?.code ?? "-"}</dd></div>
              <div><dt className="text-muted-foreground">Customers in your area</dt><dd className="font-medium">{area ? formatNumber(area.customerCount) : "-"}</dd></div>
              <div><dt className="text-muted-foreground">Customer since</dt><dd className="font-medium">{formatDate(user.createdAt)}</dd></div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
