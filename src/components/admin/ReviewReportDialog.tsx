"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormDialog } from "@/components/shared/FormDialog";
import { FormField } from "@/components/shared/FormField";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AVAILABILITY, PRIORITY, REPORT_CATEGORY_LABEL } from "@/constants/statuses";
import { formatDateTime } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { assignSchema, type AssignValues } from "@/lib/validations";
import { assignTechnician } from "@/services/outages";
import type { Area, OutageReport, Priority, Technician, User } from "@/types";

interface Props {
  report: OutageReport | null; // null = closed
  customer?: User;
  area?: Area;
  technicians: Technician[];
  onClose: () => void;
  onAssigned: () => void;
}

export function ReviewReportDialog({ report, customer, area, technicians, onClose, onAssigned }: Props) {
  return (
    <FormDialog open={!!report} onOpenChange={(o) => !o && onClose()} title={report ? `Review report ${report.id}` : "Review report"}
      description="Check the report, then assign a technician to start the repair.">
      {report && (
        <ReviewContent report={report} customer={customer} area={area} technicians={technicians}
          onDone={() => { onClose(); onAssigned(); }} />
      )}
    </FormDialog>
  );
}

interface ContentProps extends Omit<Props, "report" | "onClose" | "onAssigned"> {
  report: OutageReport;
  onDone: () => void;
}

function ReviewContent({ report, customer, area, technicians, onDone }: ContentProps) {
  const [pending, setPending] = useState<AssignValues | null>(null);
  const [busy, setBusy] = useState(false);

  const { register, control, handleSubmit, formState: { errors } } = useForm<AssignValues>({
    resolver: zodResolver(assignSchema),
    defaultValues: { technicianId: "", priority: "MEDIUM", estimatedHours: getSettings().defaultRepairHours },
  });

  const techOptions = technicians.map((t) => ({
    value: t.id,
    label: `${t.name} · ${AVAILABILITY[t.availability].label}`,
  }));
  const pendingTech = technicians.find((t) => t.id === pending?.technicianId);

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    try {
      const outage = await assignTechnician({ reportId: report.id, ...pending });
      toast.success(`Technician assigned. Outage ${outage.id} created.`);
      onDone();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not assign the technician.");
      setPending(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <dl className="grid gap-3 rounded-lg bg-muted p-3 text-sm sm:grid-cols-2">
        <div><dt className="text-muted-foreground">Customer</dt><dd className="font-medium">{customer?.name ?? report.contactName}</dd></div>
        <div><dt className="text-muted-foreground">Contact</dt><dd className="font-medium">{report.contactPhone}</dd></div>
        <div><dt className="text-muted-foreground">Area</dt><dd className="font-medium">{area?.name ?? "-"}</dd></div>
        <div><dt className="text-muted-foreground">Category</dt><dd className="font-medium">{REPORT_CATEGORY_LABEL[report.category]}</dd></div>
        <div className="sm:col-span-2"><dt className="text-muted-foreground">Location</dt><dd className="font-medium">{report.location}</dd></div>
        <div className="sm:col-span-2"><dt className="text-muted-foreground">Problem started</dt><dd className="font-medium">{formatDateTime(report.problemStart)}</dd></div>
        <div className="sm:col-span-2"><dt className="text-muted-foreground">Description</dt><dd>{report.description}</dd></div>
        {report.imageName && <div className="sm:col-span-2"><dt className="text-muted-foreground">Attached image</dt><dd className="font-medium">{report.imageName}</dd></div>}
      </dl>

      <form onSubmit={handleSubmit((values) => setPending(values))} className="space-y-4" noValidate>
        <FormField label="Technician" htmlFor="as-tech" error={errors.technicianId?.message}>
          <Controller name="technicianId" control={control} render={({ field }) => (
            <SimpleSelect id="as-tech" value={field.value} onChange={field.onChange} options={techOptions}
              placeholder="Choose a technician" invalid={!!errors.technicianId} />
          )} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Priority" htmlFor="as-priority" error={errors.priority?.message}>
            <Controller name="priority" control={control} render={({ field }) => (
              <SimpleSelect id="as-priority" value={field.value} onChange={(v) => field.onChange(v as Priority)}
                options={Object.entries(PRIORITY).map(([value, p]) => ({ value, label: p.label }))} />
            )} />
          </FormField>
          <FormField label="Estimated repair time (hours)" htmlFor="as-hours" error={errors.estimatedHours?.message}>
            <Input id="as-hours" type="number" step="any" aria-invalid={!!errors.estimatedHours} {...register("estimatedHours", { valueAsNumber: true })} />
          </FormField>
        </div>
        <Button type="submit" className="h-9 w-full">Assign technician</Button>
      </form>

      <ConfirmDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)} loading={busy}
        title="Assign this technician?" confirmLabel="Yes, assign" onConfirm={confirm}
        description={`${pendingTech?.name ?? "The technician"} will be sent to ${area?.name ?? "the area"} with ${pending ? PRIORITY[pending.priority].label.toLowerCase() : ""} priority. The customer and nearby residents will be notified.`} />
    </div>
  );
}
