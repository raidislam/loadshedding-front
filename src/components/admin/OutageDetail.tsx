"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DetailList, DetailSkeleton } from "@/components/shared/DetailList";
import { EmptyState } from "@/components/shared/EmptyState";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { HierarchyBreadcrumb } from "@/components/shared/HierarchyBreadcrumb";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OUTAGE_STATUS, OUTAGE_TYPE } from "@/constants/labels";
import { useDetail } from "@/hooks/useApi";
import { api, ApiError, errorMessage } from "@/lib/api";
import { formatDateTime, toDateTimeInput } from "@/lib/format";
import { outageEditSchema, type OutageEditValues } from "@/lib/validations";
import type { Outage, OutageStatus } from "@/types/api";

// Buttons the admin sees for each status (same flow as the backend):
// SCHEDULED -> ONGOING | CANCELLED,  ONGOING -> RESOLVED.  RESOLVED / CANCELLED are final.
interface StatusAction {
  status: OutageStatus;
  label: string;
  title: string;
  description: string;
  destructive?: boolean;
}

const STATUS_ACTIONS: Record<OutageStatus, StatusAction[]> = {
  SCHEDULED: [
    { status: "ONGOING", label: "Start outage", title: "Start this outage now?", description: "The status becomes ONGOING and customers in the area are told the power is off." },
    { status: "CANCELLED", label: "Cancel outage", title: "Cancel this outage?", description: "The planned outage will not happen. Customers in the area are told it is cancelled.", destructive: true },
  ],
  ONGOING: [
    { status: "RESOLVED", label: "Mark power restored", title: "Mark power as restored?", description: "The restoration time is recorded now and customers in the area get a 'power restored' notification." },
  ],
  RESOLVED: [],
  CANCELLED: [],
};

export function OutageDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: outage, isLoading, error } = useDetail<Outage>("outages", id);
  const [pending, setPending] = useState<StatusAction | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // PATCH /outages/:id { status }
  const changeStatus = useMutation({
    mutationFn: (status: OutageStatus) => api<Outage>(`/outages/${id}`, { method: "PATCH", body: { status } }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["outages"] });
      toast.success(`Outage is now ${OUTAGE_STATUS[data.status].label.toLowerCase()}. ${data.notifiedCustomers ?? 0} customer(s) notified.`);
    },
    onError: (e) => toast.error(errorMessage(e)),
    onSettled: () => setPending(null),
  });

  // DELETE /outages/:id (soft delete, not allowed while ONGOING)
  const remove = useMutation({
    mutationFn: () => api(`/outages/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outages"] });
      toast.success("Outage deleted.");
      router.replace("/admin/outages");
    },
    onError: (e) => toast.error(errorMessage(e)),
    onSettled: () => setDeleteOpen(false),
  });

  if (isLoading) return <DetailSkeleton />;
  if (error || !outage) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <Card>
          <EmptyState
            title="Outage not found"
            description="It may have been deleted."
            action={
              <Link href="/admin/outages" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <ArrowLeft /> Back to list
              </Link>
            }
          />
        </Card>
      );
    }
    return <p className="text-destructive">{errorMessage(error)}</p>;
  }

  const { area } = outage;
  const isFinished = outage.status === "RESOLVED" || outage.status === "CANCELLED";

  return (
    <div className="space-y-6">
      <div>
        <HierarchyBreadcrumb zone={area.feeder.substation.zone} substation={area.feeder.substation} feeder={area.feeder} area={area} />
        <PageHeader
          title={outage.title}
          description={outage.reason}
          actions={
            <>
              <StatusBadge {...OUTAGE_TYPE[outage.type]} />
              <StatusBadge {...OUTAGE_STATUS[outage.status]} />
              <Link href="/admin/outages" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <ArrowLeft /> All outages
              </Link>
            </>
          }
        />
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2">
          <p className="mr-2 text-sm font-medium">Actions</p>
          {STATUS_ACTIONS[outage.status].map((a) => (
            <Button key={a.status} variant={a.destructive ? "destructive" : "default"} onClick={() => setPending(a)}>
              {a.label}
            </Button>
          ))}
          {!isFinished && (
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil /> Edit details
            </Button>
          )}
          {outage.status !== "ONGOING" && (
            <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 /> Delete
            </Button>
          )}
          {isFinished && <p className="text-sm text-muted-foreground">This outage is {outage.status.toLowerCase()} and can no longer be changed.</p>}
        </CardContent>
      </Card>

      <DetailList
        title="Outage details"
        items={[
          { label: "Affected area", value: <Link href={`/admin/areas/${area.id}`} className="text-primary hover:underline">{area.name}</Link> },
          { label: "Feeder / substation", value: `${area.feeder.name} / ${area.feeder.substation.name}` },
          { label: "Start time", value: formatDateTime(outage.startTime) },
          { label: "Expected restoration", value: formatDateTime(outage.expectedRestoreTime) },
          { label: "Restored at", value: outage.actualRestoreTime ? formatDateTime(outage.actualRestoreTime) : "Not restored yet" },
          { label: "Linked customer reports", value: outage._count?.reports ?? 0 },
          { label: "Created", value: formatDateTime(outage.createdAt) },
          { label: "Description", value: <span className="font-normal">{outage.description || "-"}</span> },
        ]}
      />

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        loading={changeStatus.isPending}
        destructive={pending?.destructive}
        title={pending?.title ?? ""}
        description={pending?.description ?? ""}
        confirmLabel={pending?.label}
        onConfirm={() => pending && changeStatus.mutate(pending.status)}
      />
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        loading={remove.isPending}
        destructive
        title="Delete this outage?"
        confirmLabel="Delete outage"
        onConfirm={() => remove.mutate()}
        description={
          outage.status === "SCHEDULED"
            ? "It will be hidden everywhere (soft delete), and customers in the area are told it is cancelled."
            : "It will be hidden everywhere (soft delete)."
        }
      />
      <FormDialog open={editOpen} onOpenChange={setEditOpen} title="Edit outage" description="If the time changes, customers in the area are notified.">
        <EditOutageForm outage={outage} onDone={() => setEditOpen(false)} />
      </FormDialog>
    </div>
  );
}

function EditOutageForm({ outage, onDone }: { outage: Outage; onDone: () => void }) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(outageEditSchema),
    defaultValues: {
      title: outage.title,
      reason: outage.reason,
      description: outage.description ?? "",
      startTime: toDateTimeInput(outage.startTime),
      expectedRestoreTime: toDateTimeInput(outage.expectedRestoreTime),
    },
  });

  const save = useMutation({
    mutationFn: (v: OutageEditValues) =>
      api(`/outages/${outage.id}`, {
        method: "PATCH",
        body: {
          title: v.title,
          reason: v.reason,
          ...(v.description ? { description: v.description } : {}),
          startTime: new Date(v.startTime).toISOString(),
          expectedRestoreTime: new Date(v.expectedRestoreTime).toISOString(),
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outages"] });
      toast.success("Outage updated.");
      onDone();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
      <FormField label="Title" htmlFor="e-title" error={errors.title?.message}>
        <Input id="e-title" aria-invalid={!!errors.title} {...register("title")} />
      </FormField>
      <FormField label="Reason" htmlFor="e-reason" error={errors.reason?.message}>
        <Input id="e-reason" aria-invalid={!!errors.reason} {...register("reason")} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Start" htmlFor="e-start" error={errors.startTime?.message}>
          <Input id="e-start" type="datetime-local" aria-invalid={!!errors.startTime} {...register("startTime")} />
        </FormField>
        <FormField label="Expected restoration" htmlFor="e-end" error={errors.expectedRestoreTime?.message}>
          <Input id="e-end" type="datetime-local" aria-invalid={!!errors.expectedRestoreTime} {...register("expectedRestoreTime")} />
        </FormField>
      </div>
      <FormField label="Description (optional)" htmlFor="e-desc" error={errors.description?.message}>
        <Textarea id="e-desc" rows={3} aria-invalid={!!errors.description} {...register("description")} />
      </FormField>
      <Button type="submit" className="h-9 w-full" disabled={save.isPending}>
        {save.isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
