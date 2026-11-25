"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api, errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { reviewSchema, type ReviewValues } from "@/lib/validations";
import type { Outage, OutageReport } from "@/types/api";

interface Props {
  report: OutageReport | null; // null = closed
  onClose: () => void;
}

export function ReviewReportDialog({ report, onClose }: Props) {
  return (
    <FormDialog
      open={!!report}
      onOpenChange={(o) => !o && onClose()}
      title="Review report"
      description="Accept it for review (and optionally link it to an outage), or reject it with a reason."
    >
      {report && <ReviewForm report={report} onDone={onClose} />}
    </FormDialog>
  );
}

function ReviewForm({ report, onDone }: { report: OutageReport; onDone: () => void }) {
  const queryClient = useQueryClient();
  // Backend rule: PENDING -> UNDER_REVIEW | REJECTED, UNDER_REVIEW -> REJECTED
  const canMarkUnderReview = report.status === "PENDING";

  // Open outages in the same area that the report can be linked to
  const { data: outages = [] } = useQuery({
    queryKey: ["outages", "for-area", report.areaId],
    queryFn: async () => (await api<Outage[]>("/outages", { query: { areaId: report.areaId, limit: 20, sortBy: "startTime", sortOrder: "desc" } })).data,
  });
  const linkable = outages.filter((o) => o.status === "ONGOING" || o.status === "SCHEDULED");

  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { status: canMarkUnderReview ? ("UNDER_REVIEW" as const) : ("REJECTED" as const), adminNote: "", outageId: "" },
  });
  const decision = useWatch({ control, name: "status" });

  // PATCH /outage-reports/:id/status. The customer is notified.
  const review = useMutation({
    mutationFn: (v: ReviewValues) =>
      api(`/outage-reports/${report.id}/status`, {
        method: "PATCH",
        body: {
          status: v.status,
          ...(v.adminNote ? { adminNote: v.adminNote } : {}),
          ...(v.status === "UNDER_REVIEW" && v.outageId ? { outageId: v.outageId } : {}),
        },
      }),
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: ["outage-reports"] });
      queryClient.invalidateQueries({ queryKey: ["outages"] });
      toast.success(v.status === "REJECTED" ? "Report rejected. The customer was told why." : "Report is now under review. The customer was notified.");
      onDone();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <div className="space-y-4">
      <dl className="grid gap-3 rounded-lg bg-muted p-3 text-sm sm:grid-cols-2">
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Report</dt>
          <dd className="font-medium">{report.title}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Customer</dt>
          <dd className="font-medium">
            {report.customer?.name ?? "-"}
            {report.customer?.phone ? ` (${report.customer.phone})` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Area</dt>
          <dd className="font-medium">{report.area.name}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Location</dt>
          <dd className="font-medium">{report.address ?? "-"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Reported</dt>
          <dd className="font-medium">{formatDateTime(report.createdAt)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-muted-foreground">Description</dt>
          <dd>{report.description}</dd>
        </div>
      </dl>

      <form onSubmit={handleSubmit((v) => review.mutate(v))} className="space-y-4" noValidate>
        <FormField label="Decision" htmlFor="rv-status" error={errors.status?.message}>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <SimpleSelect
                id="rv-status"
                value={field.value}
                onChange={field.onChange}
                options={[
                  ...(canMarkUnderReview ? [{ value: "UNDER_REVIEW", label: "Accept - mark as under review" }] : []),
                  { value: "REJECTED", label: "Reject the report" },
                ]}
              />
            )}
          />
        </FormField>

        {decision === "UNDER_REVIEW" && (
          <FormField
            label="Link to an outage (optional)"
            htmlFor="rv-outage"
            hint={linkable.length ? "Scheduled or ongoing outages in the same area." : "There is no open outage in this area."}
          >
            <Controller
              name="outageId"
              control={control}
              render={({ field }) => (
                <SimpleSelect
                  id="rv-outage"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={linkable.length === 0}
                  placeholder="Don't link"
                  options={linkable.map((o) => ({ value: o.id, label: `${o.title} (${o.status.toLowerCase()})` }))}
                />
              )}
            />
          </FormField>
        )}

        <FormField
          label={decision === "REJECTED" ? "Reason for rejecting (shown to the customer)" : "Note (optional)"}
          htmlFor="rv-note"
          error={errors.adminNote?.message}
        >
          <Textarea id="rv-note" rows={3} aria-invalid={!!errors.adminNote} {...register("adminNote")} />
        </FormField>

        <Button type="submit" className="h-9 w-full" variant={decision === "REJECTED" ? "destructive" : "default"} disabled={review.isPending}>
          {review.isPending ? "Saving..." : decision === "REJECTED" ? "Reject report" : "Mark as under review"}
        </Button>
      </form>
    </div>
  );
}
