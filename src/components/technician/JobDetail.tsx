"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { JobActions } from "@/components/technician/JobActions";
import { WorkflowSteps } from "@/components/technician/WorkflowSteps";
import { DetailList, DetailSkeleton } from "@/components/shared/DetailList";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ASSIGNMENT_STATUS, REPORT_STATUS } from "@/constants/labels";
import { useDetail } from "@/hooks/useApi";
import { ApiError, errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Assignment } from "@/types/api";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  // GET /assignments/:id - the backend answers 403 if this job belongs to another technician
  const { data: job, isLoading, error } = useDetail<Assignment>("assignments", id);

  if (isLoading) return <DetailSkeleton />;
  if (error || !job) {
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) {
      return (
        <Card>
          <EmptyState
            title="Job not found"
            description="This job does not exist or is not assigned to you."
            action={
              <Link href="/technician/jobs" className={buttonVariants({ variant: "outline", size: "sm" })}>
                <ArrowLeft /> Back to jobs
              </Link>
            }
          />
        </Card>
      );
    }
    return <p className="text-destructive">{errorMessage(error)}</p>;
  }

  const { report } = job;
  const area = report.area;

  return (
    <div className="space-y-6">
      <PageHeader
        title={report.title}
        description={`${area.name} · ${area.feeder.substation.zone.name}`}
        actions={
          <>
            <StatusBadge {...ASSIGNMENT_STATUS[job.status]} />
            <Link href="/technician/jobs" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <ArrowLeft /> All jobs
            </Link>
          </>
        }
      />

      <WorkflowSteps status={job.status} />
      <JobActions job={job} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailList
          title="Customer report"
          items={[
            { label: "Customer", value: report.customer.name },
            { label: "Phone", value: report.customer.phone ?? "-" },
            { label: "Location", value: report.address ?? "-" },
            { label: "Reported", value: formatDateTime(report.createdAt) },
            { label: "Report status", value: <StatusBadge {...REPORT_STATUS[report.status]} /> },
            { label: "Description", value: <span className="font-normal">{report.description}</span> },
          ]}
        />
        <DetailList
          title="Job details"
          items={[
            { label: "Area", value: area.name },
            { label: "Feeder", value: `${area.feeder.name} (${area.feeder.code})` },
            { label: "Substation", value: area.feeder.substation.name },
            { label: "Zone", value: area.feeder.substation.zone.name },
            { label: "Assigned by", value: job.assignedBy.name },
            { label: "Assigned", value: formatDateTime(job.assignedAt) },
            { label: "Accepted", value: job.acceptedAt ? formatDateTime(job.acceptedAt) : "Not yet" },
            { label: "Started", value: job.startedAt ? formatDateTime(job.startedAt) : "Not yet" },
            { label: "Instructions", value: <span className="font-normal">{job.note || "-"}</span> },
          ]}
        />
      </div>
    </div>
  );
}
