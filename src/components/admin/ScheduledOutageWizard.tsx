"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/shared/FormField";
import { PageHeader } from "@/components/shared/PageHeader";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OUTAGE_TYPE, toOptions } from "@/constants/labels";
import { useOptions } from "@/hooks/useApi";
import { api, errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { outageSchema, type OutageValues } from "@/lib/validations";
import type { Area, Feeder, Outage, Substation, Zone } from "@/types/api";

const STEPS = ["Network", "Affected area", "Schedule", "Details", "Review"];

const STEP_HELP = [
  "Choose the part of the network that will be switched off.",
  "Pick the area that will lose power, and the type of outage.",
  "When will power go off and when should it return?",
  "Give the outage a title and a reason. Customers will see them.",
  "Check everything. All customers in the area get a notification.",
];

// Fields checked when pressing "Next" on each step
const STEP_FIELDS: (keyof OutageValues)[][] = [
  ["zoneId", "substationId", "feederId"],
  ["areaId", "type"],
  ["startTime", "expectedRestoreTime"],
  ["title", "reason", "description"],
  [],
];

const REASONS = [
  "Load shedding (generation shortage)",
  "Planned maintenance",
  "Transformer maintenance",
  "Line repair",
  "Equipment fault",
].map((r) => ({ value: r, label: r }));

export function ScheduledOutageWizard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);

  const { data: zones = [] } = useOptions<Zone>("zones", { sortBy: "name", sortOrder: "asc" });
  const { data: substations = [] } = useOptions<Substation>("substations", { sortBy: "name", sortOrder: "asc" });
  const { data: feeders = [] } = useOptions<Feeder>("feeders", { sortBy: "name", sortOrder: "asc" });
  const { data: areas = [] } = useOptions<Area>("areas", { sortBy: "name", sortOrder: "asc" });

  const { register, control, setValue, trigger, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(outageSchema),
    defaultValues: {
      zoneId: "",
      substationId: "",
      feederId: "",
      areaId: "",
      type: "SCHEDULED" as const,
      startTime: "",
      expectedRestoreTime: "",
      title: "",
      reason: "",
      description: "",
    },
  });

  const values = useWatch({ control });
  const substationOptions = substations.filter((s) => s.zoneId === values.zoneId).map((s) => ({ value: s.id, label: s.name }));
  const feederOptions = feeders.filter((f) => f.substationId === values.substationId).map((f) => ({ value: f.id, label: `${f.name} (${f.code})` }));
  const areaOptions = areas.filter((a) => a.feederId === values.feederId).map((a) => ({ value: a.id, label: `${a.name} (${a.code})` }));
  const nameOf = (list: { id: string; name: string }[], id?: string) => list.find((x) => x.id === id)?.name ?? "-";

  // POST /outages. The backend notifies every active customer in the area.
  const create = useMutation({
    mutationFn: (v: OutageValues) =>
      api<Outage>("/outages", {
        method: "POST",
        body: {
          title: v.title,
          type: v.type,
          areaId: v.areaId,
          startTime: new Date(v.startTime).toISOString(),
          expectedRestoreTime: new Date(v.expectedRestoreTime).toISOString(),
          reason: v.reason,
          ...(v.description ? { description: v.description } : {}),
        },
      }),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({ queryKey: ["outages"] });
      toast.success(`Outage created. ${data.notifiedCustomers ?? 0} customer(s) notified.`);
      router.push(`/admin/outages/${data.id}`);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  async function next() {
    if (await trigger(STEP_FIELDS[step])) setStep((s) => s + 1);
  }

  const isLast = step === STEPS.length - 1;

  return (
    <>
      <PageHeader
        title="Create an outage"
        description="Plan load shedding or maintenance, or record a sudden fault, in five short steps."
        actions={
          <Link href="/admin/outages" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ArrowLeft /> Cancel
          </Link>
        }
      />

      <ol className="mb-6 flex flex-wrap gap-2" aria-label="Steps">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1 text-sm",
              i === step ? "border-primary bg-primary text-primary-foreground" : i < step ? "border-green-300 bg-green-50 text-green-800" : "text-muted-foreground",
            )}
          >
            {i < step ? <Check className="size-3.5" /> : <span className="font-medium">{i + 1}</span>}
            <span className="hidden sm:inline">{label}</span>
          </li>
        ))}
      </ol>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>
            Step {step + 1}: {STEPS[step]}
          </CardTitle>
          <CardDescription>{STEP_HELP[step]}</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (isLast) void handleSubmit((v) => create.mutate(v))(e);
              else void next();
            }}
          >
            {step === 0 && (
              <>
                <FormField label="Distribution zone" htmlFor="w-zone" error={errors.zoneId?.message}>
                  <Controller
                    name="zoneId"
                    control={control}
                    render={({ field }) => (
                      <SimpleSelect
                        id="w-zone"
                        value={field.value}
                        placeholder="Choose a zone"
                        invalid={!!errors.zoneId}
                        options={zones.map((z) => ({ value: z.id, label: z.name }))}
                        onChange={(v) => {
                          field.onChange(v);
                          setValue("substationId", "");
                          setValue("feederId", "");
                          setValue("areaId", "");
                        }}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Substation" htmlFor="w-sub" error={errors.substationId?.message}>
                  <Controller
                    name="substationId"
                    control={control}
                    render={({ field }) => (
                      <SimpleSelect
                        id="w-sub"
                        value={field.value}
                        disabled={!values.zoneId}
                        invalid={!!errors.substationId}
                        placeholder={values.zoneId ? "Choose a substation" : "Choose a zone first"}
                        options={substationOptions}
                        onChange={(v) => {
                          field.onChange(v);
                          setValue("feederId", "");
                          setValue("areaId", "");
                        }}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Feeder" htmlFor="w-fdr" error={errors.feederId?.message}>
                  <Controller
                    name="feederId"
                    control={control}
                    render={({ field }) => (
                      <SimpleSelect
                        id="w-fdr"
                        value={field.value}
                        disabled={!values.substationId}
                        invalid={!!errors.feederId}
                        placeholder={values.substationId ? "Choose a feeder" : "Choose a substation first"}
                        options={feederOptions}
                        onChange={(v) => {
                          field.onChange(v);
                          setValue("areaId", "");
                        }}
                      />
                    )}
                  />
                </FormField>
              </>
            )}

            {step === 1 && (
              <>
                <FormField label="Affected area" htmlFor="w-area" error={errors.areaId?.message} hint={`Areas on feeder ${nameOf(feeders, values.feederId)}`}>
                  <Controller
                    name="areaId"
                    control={control}
                    render={({ field }) => (
                      <SimpleSelect id="w-area" value={field.value} placeholder="Choose an area" invalid={!!errors.areaId} options={areaOptions} onChange={field.onChange} />
                    )}
                  />
                </FormField>
                <FormField
                  label="Outage type"
                  htmlFor="w-type"
                  error={errors.type?.message}
                  hint="Scheduled = planned, must start in the future. Unexpected = a fault that is happening now."
                >
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => <SimpleSelect id="w-type" value={field.value} options={toOptions(OUTAGE_TYPE)} onChange={field.onChange} />}
                  />
                </FormField>
              </>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Start date and time" htmlFor="w-start" error={errors.startTime?.message}>
                  <Input id="w-start" type="datetime-local" aria-invalid={!!errors.startTime} {...register("startTime")} />
                </FormField>
                <FormField label="Expected restoration" htmlFor="w-end" error={errors.expectedRestoreTime?.message}>
                  <Input id="w-end" type="datetime-local" aria-invalid={!!errors.expectedRestoreTime} {...register("expectedRestoreTime")} />
                </FormField>
              </div>
            )}

            {step === 3 && (
              <>
                <FormField label="Title" htmlFor="w-title" error={errors.title?.message} hint="For example: Evening load shedding - Uttara Sector 7">
                  <Input id="w-title" aria-invalid={!!errors.title} {...register("title")} />
                </FormField>
                <FormField label="Reason" htmlFor="w-reason" error={errors.reason?.message}>
                  <Controller
                    name="reason"
                    control={control}
                    render={({ field }) => (
                      <SimpleSelect id="w-reason" value={field.value} placeholder="Choose a reason" invalid={!!errors.reason} options={REASONS} onChange={field.onChange} />
                    )}
                  />
                </FormField>
                <FormField label="Description (optional)" htmlFor="w-desc" error={errors.description?.message} hint="Extra details shown to customers.">
                  <Textarea id="w-desc" rows={4} aria-invalid={!!errors.description} {...register("description")} />
                </FormField>
              </>
            )}

            {step === 4 && (
              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Zone", nameOf(zones, values.zoneId)],
                  ["Substation", nameOf(substations, values.substationId)],
                  ["Feeder", nameOf(feeders, values.feederId)],
                  ["Affected area", nameOf(areas, values.areaId)],
                  ["Type", values.type ? OUTAGE_TYPE[values.type].label : "-"],
                  ["Title", values.title || "-"],
                  ["Start", values.startTime ? formatDateTime(new Date(values.startTime).toISOString()) : "-"],
                  ["Expected restoration", values.expectedRestoreTime ? formatDateTime(new Date(values.expectedRestoreTime).toISOString()) : "-"],
                  ["Reason", values.reason || "-"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
                {values.description && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm text-muted-foreground">Description</dt>
                    <dd>{values.description}</dd>
                  </div>
                )}
              </dl>
            )}

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" disabled={step === 0 || create.isPending} onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft /> Back
              </Button>
              {isLast ? (
                <Button type="submit" disabled={create.isPending}>
                  {create.isPending ? "Creating..." : "Create outage"}
                </Button>
              ) : (
                <Button type="submit">
                  Next <ArrowRight />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
