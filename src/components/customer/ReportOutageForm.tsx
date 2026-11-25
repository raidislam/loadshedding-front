"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRequiredUser } from "@/components/layout/AuthProvider";
import { FormField } from "@/components/shared/FormField";
import { PageHeader } from "@/components/shared/PageHeader";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { REPORT_STATUS } from "@/constants/labels";
import { useOptions } from "@/hooks/useApi";
import { api, errorMessage } from "@/lib/api";
import { reportSchema, type ReportValues } from "@/lib/validations";
import type { Area, OutageReport } from "@/types/api";

export function ReportOutageForm() {
  const user = useRequiredUser();
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState<OutageReport | null>(null);
  const { data: areas = [] } = useOptions<Area>("areas", { sortBy: "name", sortOrder: "asc" });

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: { title: "", description: "", address: user.address ?? "", areaId: user.areaId ?? "" },
  });

  // POST /outage-reports. Free; the backend allows one open report per area.
  const submit = useMutation({
    mutationFn: (v: ReportValues) =>
      api<OutageReport>("/outage-reports", {
        method: "POST",
        body: { title: v.title, description: v.description, areaId: v.areaId, ...(v.address ? { address: v.address } : {}) },
      }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["outage-reports"] });
      toast.success("Report submitted.");
      setSubmitted(data);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (submitted) {
    return (
      <>
        <PageHeader title="Report an outage" />
        <Card className="max-w-xl">
          <CardContent className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto size-12 text-green-600" />
            <div>
              <p className="text-lg font-semibold">Thank you, your report was received</p>
              <p className="text-sm text-muted-foreground">You can follow it under My Reports.</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="font-medium">{submitted.title}</p>
              <p className="text-sm text-muted-foreground">{submitted.area.name}</p>
              <div className="mt-2">
                <StatusBadge {...REPORT_STATUS[submitted.status]} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              The control room will review your report and send a technician. You get a notification at every step.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/dashboard/my-reports" className={buttonVariants()}>
                Track my reports
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  reset();
                  setSubmitted(null);
                }}
              >
                Report another problem
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Report an outage" description="Tell us what is wrong with your electricity supply. Reporting is free." />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Problem details</CardTitle>
          <CardDescription>You can have one open report per area at a time.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((v) => submit.mutate(v))} className="space-y-4" noValidate>
            <FormField label="Short title" htmlFor="r-title" error={errors.title?.message} hint="For example: No electricity since 8 PM">
              <Input id="r-title" aria-invalid={!!errors.title} {...register("title")} />
            </FormField>
            <FormField label="What happened?" htmlFor="r-desc" error={errors.description?.message}>
              <Textarea id="r-desc" rows={4} aria-invalid={!!errors.description} {...register("description")} />
            </FormField>
            <FormField label="Area" htmlFor="r-area" error={errors.areaId?.message} hint="Pre-filled with your service area.">
              <Controller
                name="areaId"
                control={control}
                render={({ field }) => (
                  <SimpleSelect
                    id="r-area"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Choose the area"
                    invalid={!!errors.areaId}
                    options={areas.map((a) => ({ value: a.id, label: `${a.name} (${a.feeder.substation.zone.name})` }))}
                  />
                )}
              />
            </FormField>
            <FormField
              label="Exact location (optional)"
              htmlFor="r-address"
              error={errors.address?.message}
              hint="House, road and a nearby landmark help the technician find the problem."
            >
              <Input id="r-address" aria-invalid={!!errors.address} {...register("address")} />
            </FormField>
            <Button type="submit" size="lg" className="h-10 px-4" disabled={submit.isPending}>
              {submit.isPending ? "Submitting..." : "Submit report"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
