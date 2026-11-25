"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api, errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { repairReportSchema, type RepairReportValues } from "@/lib/validations";
import type { Assignment } from "@/types/api";

// Refresh every list and detail that shows jobs, reports or outages
function useRefreshJobs() {
  const queryClient = useQueryClient();
  return () => {
    for (const key of ["assignments", "technicians", "outage-reports", "outages", "notifications"]) {
      queryClient.invalidateQueries({ queryKey: [key] });
    }
  };
}

// What the technician can do depends on the job status:
// ASSIGNED -> Accept,  ACCEPTED -> Start work,  IN_PROGRESS -> Submit repair report,  COMPLETED -> done
export function JobActions({ job }: { job: Assignment }) {
  if (job.status === "COMPLETED") {
    const repair = job.repairRecords[0];
    return (
      <Card>
        <CardContent className="space-y-1 text-sm">
          <p className="font-medium text-green-800">This job is finished and power has been restored.</p>
          <p className="text-muted-foreground">Completed on {formatDateTime(job.completedAt ?? undefined)}.</p>
          {repair && (
            <p>
              <span className="text-muted-foreground">Work done:</span> {repair.workDescription}
              {repair.partsUsed ? ` (parts: ${repair.partsUsed})` : ""}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
  if (job.status === "IN_PROGRESS") return <RepairReportForm job={job} />;
  return <StatusStep job={job} />;
}

// ASSIGNED -> ACCEPTED, ACCEPTED -> IN_PROGRESS (PATCH /assignments/:id/status)
function StatusStep({ job }: { job: Assignment }) {
  const refresh = useRefreshJobs();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const next = job.status === "ASSIGNED" ? "ACCEPTED" : "IN_PROGRESS";

  const change = useMutation({
    mutationFn: () => api(`/assignments/${job.id}/status`, { method: "PATCH", body: { status: next } }),
    onSuccess: () => {
      toast.success(next === "ACCEPTED" ? "Job accepted. The customer was told you are coming." : "Work started. The customer was notified.");
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e)),
    onSettled: () => setConfirmOpen(false),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{job.status === "ASSIGNED" ? "New job" : "Ready to start"}</CardTitle>
        <CardDescription>
          {job.status === "ASSIGNED"
            ? "Accept the job to let the customer and the control room know you will handle it."
            : "Start the work when you reach the location. The customer's report moves to 'Repair in progress'."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => setConfirmOpen(true)}>{job.status === "ASSIGNED" ? "Accept job" : "Start work"}</Button>
      </CardContent>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={change.isPending}
        title={job.status === "ASSIGNED" ? "Accept this job?" : "Start working on this job now?"}
        description="The customer gets a notification."
        confirmLabel={job.status === "ASSIGNED" ? "Accept job" : "Start work"}
        onConfirm={() => change.mutate()}
      />
    </Card>
  );
}

// IN_PROGRESS -> COMPLETED (POST /assignments/:id/repair-report).
// The backend also resolves the report (and the linked outage) and notifies everyone.
function RepairReportForm({ job }: { job: Assignment }) {
  const refresh = useRefreshJobs();
  const [pending, setPending] = useState<RepairReportValues | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(repairReportSchema),
    defaultValues: { workDescription: "", partsUsed: "", restoredAt: "" },
  });

  const submit = useMutation({
    mutationFn: (v: RepairReportValues) =>
      api<Assignment>(`/assignments/${job.id}/repair-report`, {
        method: "POST",
        body: {
          workDescription: v.workDescription,
          ...(v.partsUsed ? { partsUsed: v.partsUsed } : {}),
          ...(v.restoredAt ? { restoredAt: new Date(v.restoredAt).toISOString() } : {}),
        },
      }),
    onSuccess: ({ data }) => {
      toast.success(data.outageResolved ? "Job completed. The outage is resolved and the whole area was notified." : "Job completed and power restored.");
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e)),
    onSettled: () => setPending(null),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit repair report</CardTitle>
        <CardDescription>When the power is back, describe what you did. This completes the job.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((v) => setPending(v))} className="space-y-4" noValidate>
          <FormField label="Work done" htmlFor="rp-work" error={errors.workDescription?.message}>
            <Textarea id="rp-work" rows={4} aria-invalid={!!errors.workDescription} {...register("workDescription")} />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Parts used (optional)" htmlFor="rp-parts" error={errors.partsUsed?.message}>
              <Input id="rp-parts" placeholder="e.g. HT fuse x1" aria-invalid={!!errors.partsUsed} {...register("partsUsed")} />
            </FormField>
            <FormField label="Power restored at (optional)" htmlFor="rp-time" error={errors.restoredAt?.message} hint="Leave empty for now.">
              <Input id="rp-time" type="datetime-local" aria-invalid={!!errors.restoredAt} {...register("restoredAt")} />
            </FormField>
          </div>
          <Button type="submit">Submit repair report</Button>
        </form>
      </CardContent>
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        loading={submit.isPending}
        title="Submit the repair report?"
        description="The job becomes COMPLETED, the customer's report is resolved, and the customer and admins are notified. This can't be undone."
        confirmLabel="Submit"
        onConfirm={() => pending && submit.mutate(pending)}
      />
    </Card>
  );
}
