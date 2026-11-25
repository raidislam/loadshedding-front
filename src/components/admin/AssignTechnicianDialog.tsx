"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useOptions } from "@/hooks/useApi";
import { api, errorMessage } from "@/lib/api";
import { assignSchema, type AssignValues } from "@/lib/validations";
import type { OutageReport, User } from "@/types/api";

interface Props {
  report: OutageReport | null; // null = closed
  onClose: () => void;
}

// Two uses:
//  - report has no assignment  -> POST /assignments (report must be UNDER_REVIEW)
//  - report already assigned   -> PATCH /assignments/:id/technician (only before work starts)
export function AssignTechnicianDialog({ report, onClose }: Props) {
  const isChange = !!report?.assignment;
  return (
    <FormDialog
      open={!!report}
      onOpenChange={(o) => !o && onClose()}
      title={isChange ? "Change technician" : "Assign a technician"}
      description={
        isChange
          ? "The job goes back to ASSIGNED for the new technician. Both technicians and the customer are notified."
          : "The technician gets a 'new job' notification and the customer is told who is coming."
      }
    >
      {report && <AssignForm report={report} onDone={onClose} />}
    </FormDialog>
  );
}

function AssignForm({ report, onDone }: { report: OutageReport; onDone: () => void }) {
  const queryClient = useQueryClient();
  const current = report.assignment;

  // Only ACTIVE technicians can get jobs
  const { data: technicians = [], isLoading } = useOptions<User>("admin/users", { role: "TECHNICIAN", status: "ACTIVE", sortBy: "name", sortOrder: "asc" });
  const options = technicians
    .filter((t) => t.id !== current?.technician.id)
    .map((t) => ({ value: t.id, label: `${t.name}${t.phone ? ` · ${t.phone}` : ""}` }));

  const { control, register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(assignSchema),
    defaultValues: { technicianId: "", note: "" },
  });

  const save = useMutation({
    mutationFn: (v: AssignValues) =>
      current
        ? api(`/assignments/${current.id}/technician`, { method: "PATCH", body: { technicianId: v.technicianId } })
        : api("/assignments", { method: "POST", body: { reportId: report.id, technicianId: v.technicianId, ...(v.note ? { note: v.note } : {}) } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outage-reports"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success(current ? "Technician changed." : "Technician assigned.");
      onDone();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
      <div className="rounded-lg bg-muted p-3 text-sm">
        <p className="font-medium">{report.title}</p>
        <p className="text-muted-foreground">
          {report.area.name}
          {report.address ? ` · ${report.address}` : ""}
        </p>
        {current && <p className="mt-1">Current technician: {current.technician.name}</p>}
      </div>
      <FormField label="Technician" htmlFor="as-tech" error={errors.technicianId?.message} hint={!isLoading && options.length === 0 ? "No other active technician. Create one under User Management." : undefined}>
        <Controller
          name="technicianId"
          control={control}
          render={({ field }) => (
            <SimpleSelect
              id="as-tech"
              value={field.value}
              onChange={field.onChange}
              options={options}
              placeholder={isLoading ? "Loading technicians..." : "Choose a technician"}
              invalid={!!errors.technicianId}
            />
          )}
        />
      </FormField>
      {!current && (
        <FormField label="Instructions for the technician (optional)" htmlFor="as-note" error={errors.note?.message}>
          <Textarea id="as-note" rows={3} aria-invalid={!!errors.note} {...register("note")} />
        </FormField>
      )}
      <Button type="submit" className="h-9 w-full" disabled={save.isPending}>
        {save.isPending ? "Saving..." : current ? "Change technician" : "Assign technician"}
      </Button>
    </form>
  );
}
