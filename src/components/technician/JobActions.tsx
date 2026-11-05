"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/format";
import {
  completionSchema,
  repairNoteSchema,
  type CompletionValues,
  type RepairNoteValues,
} from "@/lib/validations";
import { acceptAssignment, updateRepairProgress } from "@/services/technicians";
import type { Outage } from "@/types";

const MAX_FILES = 5;
const MAX_MB = 5;

interface Props {
  job: Outage;
  technicianName: string;
  onChanged: () => void; // reload the job after any change
}

// All technician actions for one job. What is shown depends on the job status:
// ASSIGNED -> accept, then start repair
// IN_PROGRESS -> add notes, upload evidence, submit completion
export function JobActions({ job, technicianName, onChanged }: Props) {
  if (job.status === "RESTORED") {
    return (
      <Card>
        <CardContent className="text-sm">
          <p className="font-medium text-green-800">
            This job is finished and power has been restored.
          </p>
          <p className="text-muted-foreground">
            Restored on {formatDateTime(job.restoredAt)}.
          </p>
        </CardContent>
      </Card>
    );
  }
  if (job.status === "REPAIR_COMPLETED") {
    return (
      <Card>
        <CardContent className="text-sm">
          <p className="font-medium">
            Repair submitted. Waiting for the administrator to confirm
            restoration.
          </p>
          <p className="text-muted-foreground">
            You do not need to do anything else for this job.
          </p>
        </CardContent>
      </Card>
    );
  }
  if (job.status === "ASSIGNED") {
    return (
      <StartSection
        job={job}
        technicianName={technicianName}
        onChanged={onChanged}
      />
    );
  }
  if (job.status === "IN_PROGRESS") {
    return (
      <div className="space-y-6">
        <NoteSection
          job={job}
          technicianName={technicianName}
          onChanged={onChanged}
        />
        <EvidenceSection
          job={job}
          technicianName={technicianName}
          onChanged={onChanged}
        />
        <CompletionSection
          job={job}
          technicianName={technicianName}
          onChanged={onChanged}
        />
      </div>
    );
  }
  return null;
}

// ---------- Accept + start ----------
function StartSection({ job, technicianName, onChanged }: Props) {
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const accepted = !!job.acceptedAt;

  async function accept() {
    setBusy(true);
    try {
      await acceptAssignment(job.id, technicianName);
      toast.success("Assignment accepted.");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not accept the job.");
    } finally {
      setBusy(false);
    }
  }

  async function start() {
    setBusy(true);
    try {
      await updateRepairProgress(job.id, {
        author: technicianName,
        status: "IN_PROGRESS",
      });
      toast.success("Repair started. The customer has been notified.");
      onChanged();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not start the repair.",
      );
    } finally {
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{accepted ? "Ready to start" : "New assignment"}</CardTitle>
        <CardDescription>
          {accepted
            ? `You accepted this job on ${formatDateTime(job.acceptedAt)}. Start the repair when you are at the site.`
            : "Accept this job to confirm you will attend it."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {accepted ? (
          <Button onClick={() => setConfirmOpen(true)} disabled={busy}>
            Start repair
          </Button>
        ) : (
          <Button onClick={accept} disabled={busy}>
            {busy ? "Accepting..." : "Accept assignment"}
          </Button>
        )}
      </CardContent>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        loading={busy}
        title="Start the repair now?"
        description="The job will move to In Progress and the customer will be told that work has started."
        confirmLabel="Start repair"
        onConfirm={start}
      />
    </Card>
  );
}

// ---------- Repair note + progress ----------
function NoteSection({ job, technicianName, onChanged }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RepairNoteValues>({
    resolver: zodResolver(repairNoteSchema),
    defaultValues: { note: "", progress: Math.min(job.progress, 99) },
  });

  async function onSubmit(values: RepairNoteValues) {
    if (values.progress < job.progress) {
      setError("progress", {
        message: `Progress cannot go back. It is already ${job.progress}%.`,
      });
      return;
    }
    try {
      await updateRepairProgress(job.id, {
        author: technicianName,
        note: values.note,
        progress: values.progress,
      });
      toast.success("Repair note saved.");
      reset({ note: "", progress: values.progress });
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the note.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add repair note</CardTitle>
        <CardDescription>
          Describe what you found or did, and update the progress.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <FormField label="Note" htmlFor="j-note" error={errors.note?.message}>
            <Textarea
              id="j-note"
              rows={3}
              aria-invalid={!!errors.note}
              {...register("note")}
            />
          </FormField>
          <FormField
            label="Repair progress (%)"
            htmlFor="j-progress"
            error={errors.progress?.message}
          >
            <Input
              id="j-progress"
              type="number"
              className="sm:w-40"
              aria-invalid={!!errors.progress}
              {...register("progress", { valueAsNumber: true })}
            />
          </FormField>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save note"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ---------- Evidence ----------
function EvidenceSection({ job, technicianName, onChanged }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  function choose(list: FileList | null) {
    setError("");
    const chosen = Array.from(list ?? []);
    if (chosen.length > MAX_FILES) {
      setError(`Choose at most ${MAX_FILES} photos at a time.`);
      setFiles([]);
      return;
    }
    if (chosen.some((f) => !f.type.startsWith("image/"))) {
      setError("Only image files are allowed.");
      setFiles([]);
      return;
    }
    if (chosen.some((f) => f.size > MAX_MB * 1024 * 1024)) {
      setError(`Each photo must be smaller than ${MAX_MB} MB.`);
      setFiles([]);
      return;
    }
    setFiles(chosen);
  }

  async function upload() {
    setBusy(true);
    try {
      // Demo: only the file names are saved. Nothing is uploaded anywhere.
      await updateRepairProgress(job.id, {
        author: technicianName,
        evidenceFiles: files.map((f) => f.name),
      });
      toast.success(
        `${files.length} photo${files.length === 1 ? "" : "s"} added as evidence.`,
      );
      setFiles([]);
      setInputKey((k) => k + 1);
      onChanged();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not add the evidence.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload repair evidence</CardTitle>
        <CardDescription>
          Photos of the fault or the finished repair. In this demo only the file
          names are saved.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <FormField
          label="Photos"
          htmlFor="j-evidence"
          error={error}
          hint={
            files.length
              ? `${files.length} selected: ${files.map((f) => f.name).join(", ")}`
              : `Up to ${MAX_FILES} images, ${MAX_MB} MB each.`
          }
        >
          <Input
            key={inputKey}
            id="j-evidence"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => choose(e.target.files)}
          />
        </FormField>
        <Button onClick={upload} disabled={files.length === 0 || busy}>
          {busy ? "Adding..." : "Add evidence"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ---------- Completion ----------
function CompletionSection({ job, technicianName, onChanged }: Props) {
  const [pending, setPending] = useState<CompletionValues | null>(null);
  const [busy, setBusy] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompletionValues>({
    resolver: zodResolver(completionSchema),
    defaultValues: { summary: "" },
  });

  async function confirm() {
    if (!pending) return;
    setBusy(true);
    try {
      await updateRepairProgress(job.id, {
        author: technicianName,
        summary: pending.summary,
        status: "REPAIR_COMPLETED",
      });
      toast.success(
        "Repair submitted. The administrator will confirm restoration.",
      );
      onChanged();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Could not submit the repair.",
      );
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit completion</CardTitle>
        <CardDescription>
          Finished the repair? Write a short summary and submit it for
          confirmation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((v) => setPending(v))}
          className="space-y-4"
          noValidate
        >
          <FormField
            label="Repair summary"
            htmlFor="j-summary"
            error={errors.summary?.message}
          >
            <Textarea
              id="j-summary"
              rows={3}
              aria-invalid={!!errors.summary}
              {...register("summary")}
            />
          </FormField>
          <Button type="submit">Mark repair completed</Button>
        </form>
      </CardContent>
      <ConfirmDialog
        open={!!pending}
        onOpenChange={(o) => !o && setPending(null)}
        loading={busy}
        title="Submit this repair as completed?"
        confirmLabel="Submit repair"
        onConfirm={confirm}
        description="The job will be marked Repair Completed and can no longer be edited. The administrator will confirm that power is restored."
      />
    </Card>
  );
}
