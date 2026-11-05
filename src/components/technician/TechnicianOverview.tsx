"use client";

import Link from "next/link";
import { Briefcase, CheckCircle2, Clock, Hammer } from "lucide-react";
import { useRequiredUser } from "@/components/layout/AuthProvider";
import { useTechnicianJobs } from "@/components/technician/useTechnicianJobs";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CardsSkeleton } from "@/components/shared/TableSkeleton";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AVAILABILITY,
  OUTAGE_STATUS,
  PRIORITY,
  PRIORITY_ORDER,
} from "@/constants/statuses";
import { formatDateTime } from "@/lib/format";

export function TechnicianOverview() {
  const user = useRequiredUser();
  const { data, error } = useTechnicianJobs();

  if (error) return <p className="text-destructive">{error}</p>;
  if (!data) {
    return (
      <div className="space-y-4">
        <PageHeader title="Dashboard" />
        <CardsSkeleton />
      </div>
    );
  }

  const { technician, jobs, areas } = data;
  if (!technician) {
    return (
      <Card>
        <EmptyState
          title="Technician profile not found"
          description="Ask an administrator to set up your technician record."
        />
      </Card>
    );
  }

  const areaName = (id: string) => areas.find((a) => a.id === id)?.name ?? "-";
  const pending = jobs.filter((j) => j.status === "ASSIGNED");
  const inProgress = jobs.filter((j) => j.status === "IN_PROGRESS");
  const completed = jobs.filter((j) =>
    ["REPAIR_COMPLETED", "RESTORED"].includes(j.status),
  );
  const open = [...pending, ...inProgress].sort(
    (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${user.name.split(" ")[0]}`}
        description={`${technician.specialty} · Employee ${technician.employeeId}`}
        actions={
          <>
            <StatusBadge {...AVAILABILITY[technician.availability]} />
            <Link
              href="/technician/profile"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Change availability
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Assigned jobs"
          value={pending.length + inProgress.length}
          icon={Briefcase}
          hint="Pending plus in progress"
        />
        <StatCard
          title="Pending jobs"
          value={pending.length}
          icon={Clock}
          tone="warning"
          hint="Waiting to be started"
        />
        <StatCard
          title="In progress"
          value={inProgress.length}
          icon={Hammer}
          tone="danger"
        />
        <StatCard
          title="Completed jobs"
          value={completed.length}
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s workload</CardTitle>
          <CardDescription>
            {open.length === 0
              ? "No open jobs right now."
              : `${open.length} open job${open.length === 1 ? "" : "s"}, most urgent first.`}
          </CardDescription>
          <CardAction>
            <Link
              href="/technician/jobs"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              All jobs
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          {open.length === 0 ? (
            <EmptyState
              title="You are all caught up"
              description="New assignments from the control room will appear here."
            />
          ) : (
            <ul className="divide-y">
              {open.map((job) => (
                <li
                  key={job.id}
                  className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">
                      {job.id} · {areaName(job.areaId)}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {job.reason} · assigned {formatDateTime(job.assignedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge {...PRIORITY[job.priority]} />
                    <StatusBadge {...OUTAGE_STATUS[job.status]} />
                    <Link
                      href={`/technician/jobs/${job.id}`}
                      className={buttonVariants({ size: "sm" })}
                    >
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
