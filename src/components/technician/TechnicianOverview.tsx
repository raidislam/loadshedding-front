"use client";

import { useQuery } from "@tanstack/react-query";
import { Briefcase, CheckCircle2, Clock, Hammer } from "lucide-react";
import Link from "next/link";
import { useRequiredUser } from "@/components/layout/AuthProvider";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CardsSkeleton } from "@/components/shared/TableSkeleton";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ASSIGNMENT_STATUS } from "@/constants/labels";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Assignment } from "@/types/api";

// Open jobs (up to 100) + how many jobs are completed
async function loadOverview() {
  const [open, history] = await Promise.all([
    api<Assignment[]>("/technicians/my-jobs", { query: { limit: 100 } }),
    api<Assignment[]>("/technicians/my-history", { query: { limit: 1 } }),
  ]);
  return { open: open.data, completed: history.meta?.total ?? 0 };
}

export function TechnicianOverview() {
  const user = useRequiredUser();
  const { data, error } = useQuery({ queryKey: ["technicians", "overview"], queryFn: loadOverview });

  if (error) return <p className="text-destructive">{error.message}</p>;
  if (!data) {
    return (
      <div className="space-y-4">
        <PageHeader title="Dashboard" />
        <CardsSkeleton />
      </div>
    );
  }

  const count = (status: Assignment["status"]) => data.open.filter((j) => j.status === status).length;

  return (
    <div className="space-y-6">
      <PageHeader title={`Hello, ${user.name.split(" ")[0]}`} description="Your repair jobs at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="New jobs" value={count("ASSIGNED")} icon={Briefcase} hint="Waiting for you to accept" />
        <StatCard title="Accepted" value={count("ACCEPTED")} icon={Clock} tone="warning" hint="Not started yet" />
        <StatCard title="In progress" value={count("IN_PROGRESS")} icon={Hammer} tone="danger" />
        <StatCard title="Completed" value={data.completed} icon={CheckCircle2} tone="success" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s workload</CardTitle>
          <CardDescription>
            {data.open.length === 0 ? "No open jobs right now." : `${data.open.length} open job${data.open.length === 1 ? "" : "s"}, oldest first.`}
          </CardDescription>
          <CardAction>
            <Link href="/technician/jobs" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              All jobs
            </Link>
          </CardAction>
        </CardHeader>
        <CardContent>
          {data.open.length === 0 ? (
            <EmptyState title="You are all caught up" description="New assignments from the control room will appear here." />
          ) : (
            <ul className="divide-y">
              {data.open.slice(0, 5).map((job) => (
                <li key={job.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium">
                      {job.report.title} · {job.report.area.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {job.report.customer.name} · assigned {formatDateTime(job.assignedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusBadge {...ASSIGNMENT_STATUS[job.status]} />
                    <Link href={`/technician/jobs/${job.id}`} className={buttonVariants({ size: "sm" })}>
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
