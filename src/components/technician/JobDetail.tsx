"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useRequiredUser } from "@/components/layout/AuthProvider";
import { JobActions } from "@/components/technician/JobActions";
import { WorkflowSteps } from "@/components/technician/WorkflowSteps";
import { DetailList, DetailSkeleton } from "@/components/shared/DetailList";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  OUTAGE_STATUS,
  OUTAGE_TYPE,
  PRIORITY,
  REPORT_CATEGORY_LABEL,
} from "@/constants/statuses";
import { useLoad } from "@/hooks/useLoad";
import { formatDateTime } from "@/lib/format";
import { getAreas } from "@/services/areas";
import { getUserById } from "@/services/auth";
import { getFeeders } from "@/services/feeders";
import { getOutageById } from "@/services/outages";
import { getReportById } from "@/services/reports";
import { getSubstations } from "@/services/substations";
import { getTechnicianByUserId } from "@/services/technicians";
import { getZones } from "@/services/zones";

async function loadJob(userId: string, jobId: string) {
  const technician = await getTechnicianByUserId(userId);
  const outage = await getOutageById(jobId);
  // A technician may only open their own jobs
  const job =
    outage && technician && outage.technicianId === technician.id
      ? outage
      : undefined;
  const report = job?.reportId ? await getReportById(job.reportId) : undefined;
  const [customer, zones, substations, feeders, areas] = await Promise.all([
    report ? getUserById(report.customerId) : Promise.resolve(undefined),
    getZones(),
    getSubstations(),
    getFeeders(),
    getAreas(),
  ]);
  return {
    technician,
    job,
    report,
    customer,
    zones,
    substations,
    feeders,
    areas,
  };
}

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const user = useRequiredUser();
  const [loader] = useState(() => () => loadJob(user.id, id));
  const { data, loading, error, reload } = useLoad(loader);

  if (loading) return <DetailSkeleton />;
  if (error || !data) return <p className="text-destructive">{error}</p>;

  const { technician, job, report, customer } = data;
  if (!job || !technician) {
    return (
      <Card>
        <EmptyState
          title="Job not found"
          description="This job does not exist or is not assigned to you."
          action={
            <Link
              href="/technician/jobs"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ArrowLeft /> Back to jobs
            </Link>
          }
        />
      </Card>
    );
  }

  const area = data.areas.find((a) => a.id === job.areaId);
  const zone = data.zones.find((z) => z.id === job.zoneId);
  const substation = data.substations.find((s) => s.id === job.substationId);
  const feeder = data.feeders.find((f) => f.id === job.feederId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Job ${job.id}`}
        description={`${job.reason} · ${area?.name ?? ""}`}
        actions={
          <>
            <StatusBadge {...OUTAGE_TYPE[job.type]} />
            <StatusBadge {...PRIORITY[job.priority]} />
            <StatusBadge {...OUTAGE_STATUS[job.status]} />
            <Link
              href="/technician/jobs"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <ArrowLeft /> All jobs
            </Link>
          </>
        }
      />

      <WorkflowSteps status={job.status} />

      <JobActions
        job={job}
        technicianName={technician.name}
        onChanged={reload}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <DetailList
          title="Outage details"
          items={[
            { label: "Zone", value: zone?.name ?? "-" },
            { label: "Substation", value: substation?.name ?? "-" },
            { label: "Feeder", value: feeder?.code ?? "-" },
            { label: "Area", value: area?.name ?? "-" },
            {
              label: "Priority",
              value: <StatusBadge {...PRIORITY[job.priority]} />,
            },
            { label: "Assigned on", value: formatDateTime(job.assignedAt) },
            { label: "Outage started", value: formatDateTime(job.startTime) },
            {
              label: "Expected restoration",
              value: formatDateTime(job.expectedRestoration),
            },
            {
              label: "Description",
              value: <span className="font-normal">{job.description}</span>,
            },
          ]}
        />

        {report ? (
          <DetailList
            title={`Customer report ${report.id}`}
            items={[
              {
                label: "Customer",
                value: customer?.name ?? report.contactName,
              },
              { label: "Contact phone", value: report.contactPhone },
              {
                label: "Problem",
                value: REPORT_CATEGORY_LABEL[report.category],
              },
              { label: "Reported on", value: formatDateTime(report.createdAt) },
              { label: "Location", value: report.location },
              { label: "Customer photo", value: report.imageName ?? "None" },
              {
                label: "Customer description",
                value: (
                  <span className="font-normal">{report.description}</span>
                ),
              },
            ]}
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Customer report</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              This job was created by the control room, so there is no customer
              report attached.
            </CardContent>
          </Card>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Repair progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">{job.progress}%</span>
            </div>
            <Progress value={job.progress} />
          </div>
          {job.completionSummary && (
            <div>
              <p className="text-sm text-muted-foreground">
                Completion summary
              </p>
              <p className="text-sm">{job.completionSummary}</p>
            </div>
          )}
          {job.evidenceFiles.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground">Evidence files</p>
              <ul className="list-disc pl-5 text-sm">
                {job.evidenceFiles.map((f, i) => (
                  <li key={`${f}-${i}`}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <p className="mb-1 text-sm text-muted-foreground">Repair notes</p>
            {job.repairNotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            ) : (
              <ul className="divide-y">
                {[...job.repairNotes].reverse().map((n) => (
                  <li key={n.id} className="py-2.5">
                    <p className="text-sm">{n.note}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {n.author} · {formatDateTime(n.createdAt)} · {n.progress}%
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
