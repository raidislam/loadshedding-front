"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useAuth } from "@/components/layout/AuthProvider";
import { useTechnicianJobs } from "@/components/technician/useTechnicianJobs";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormField } from "@/components/shared/FormField";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AVAILABILITY } from "@/constants/statuses";
import { profileSchema, type ProfileValues } from "@/lib/validations";
import {
  setAvailability,
  updateTechnicianContact,
} from "@/services/technicians";
import type { Availability, Technician, User } from "@/types";

export function TechnicianProfile() {
  const { user } = useAuth();
  const { data, error, reload } = useTechnicianJobs();

  if (error) return <p className="text-destructive">{error}</p>;
  if (!data || !user) return <Skeleton className="h-96 w-full" />;
  if (!data.technician) {
    return (
      <Card>
        <EmptyState
          title="Technician profile not found"
          description="Ask an administrator to set up your technician record."
        />
      </Card>
    );
  }

  const zone = data.zones.find((z) => z.id === data.technician?.zoneId);
  const openJobs = data.jobs.filter((j) =>
    ["ASSIGNED", "IN_PROGRESS"].includes(j.status),
  ).length;
  const completed = data.jobs.filter((j) =>
    ["REPAIR_COMPLETED", "RESTORED"].includes(j.status),
  ).length;

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Your details, assigned zone and availability."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ContactCard
          user={user}
          technician={data.technician}
          onSaved={reload}
        />
        <div className="space-y-6">
          <AvailabilityCard
            technician={data.technician}
            openJobs={openJobs}
            onChanged={reload}
          />
          <Card>
            <CardHeader>
              <CardTitle>Work details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Employee ID</dt>
                  <dd className="font-medium">{data.technician.employeeId}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Specialty</dt>
                  <dd className="font-medium">{data.technician.specialty}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Assigned zone</dt>
                  <dd className="font-medium">{zone?.name ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Jobs completed</dt>
                  <dd className="font-medium">{completed}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function ContactCard({
  user,
  technician,
  onSaved,
}: {
  user: User;
  technician: Technician;
  onSaved: () => void;
}) {
  const { updateProfile } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone,
      address: user.address ?? "",
    },
  });

  async function onSubmit(values: ProfileValues) {
    try {
      await updateProfile(values);
      await updateTechnicianContact(technician.id, {
        name: values.name,
        phone: values.phone,
      });
      toast.success("Profile updated.");
      onSaved();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not update your profile.",
      );
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact information</CardTitle>
        <CardDescription>Your email cannot be changed.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <FormField label="Email" htmlFor="t-email">
            <Input id="t-email" value={user.email} disabled readOnly />
          </FormField>
          <FormField
            label="Full name"
            htmlFor="t-name"
            error={errors.name?.message}
          >
            <Input
              id="t-name"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
          </FormField>
          <FormField
            label="Mobile number"
            htmlFor="t-phone"
            error={errors.phone?.message}
          >
            <Input
              id="t-phone"
              type="tel"
              aria-invalid={!!errors.phone}
              {...register("phone")}
            />
          </FormField>
          <FormField
            label="Depot address"
            htmlFor="t-address"
            error={errors.address?.message}
          >
            <Input
              id="t-address"
              aria-invalid={!!errors.address}
              {...register("address")}
            />
          </FormField>
          <Button type="submit" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function AvailabilityCard({
  technician,
  openJobs,
  onChanged,
}: {
  technician: Technician;
  openJobs: number;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function change(value: Availability) {
    setBusy(true);
    try {
      await setAvailability(technician.id, value);
      toast.success(`You are now ${AVAILABILITY[value].label.toLowerCase()}.`);
      onChanged();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not change availability.",
      );
    } finally {
      setBusy(false);
    }
  }

  // "On duty" is Available when there is no work, or Busy while jobs are open
  // (Busy is set automatically). Off duty is always a choice.
  const onDuty: Availability = openJobs > 0 ? "BUSY" : "AVAILABLE";
  const choices: { value: Availability; label: string }[] = [
    { value: onDuty, label: openJobs > 0 ? "On duty (busy)" : "Available" },
    { value: "OFF_DUTY", label: "Off duty" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>
          Administrators only assign jobs to technicians who are available.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          Current status:{" "}
          <StatusBadge {...AVAILABILITY[technician.availability]} />
        </div>
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Set availability"
        >
          {choices.map((c) => (
            <Button
              key={c.value}
              variant={
                technician.availability === c.value ? "default" : "outline"
              }
              disabled={busy || technician.availability === c.value}
              aria-pressed={technician.availability === c.value}
              onClick={() => change(c.value)}
            >
              {c.label}
            </Button>
          ))}
        </div>
        {openJobs > 0 && (
          <p className="text-xs text-muted-foreground">
            You have {openJobs} open job{openJobs === 1 ? "" : "s"}, so being on
            duty shows you as Busy. You become Available once they are finished.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
