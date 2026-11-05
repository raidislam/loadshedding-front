"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { FormField } from "@/components/shared/FormField";
import { PageHeader } from "@/components/shared/PageHeader";
import { SimpleSelect } from "@/components/shared/SimpleSelect";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useLoad } from "@/hooks/useLoad";
import { formatDateTime, formatNumber } from "@/lib/format";
import { getSettings } from "@/lib/settings";
import { scheduledOutageSchema, type ScheduledOutageValues } from "@/lib/validations";
import { getAreas } from "@/services/areas";
import { getFeeders } from "@/services/feeders";
import { createScheduledOutage } from "@/services/outages";
import { getSubstations } from "@/services/substations";
import { getZones } from "@/services/zones";
import { cn } from "@/lib/utils";
import type { Area, Feeder, Substation, Zone } from "@/types";

const STEPS = ["Infrastructure", "Affected area", "Schedule", "Reason & notice", "Review"];

// Which form fields belong to each step. Only these are validated when pressing "Next".
const STEP_FIELDS: (keyof ScheduledOutageValues)[][] = [
  ["zoneId", "substationId", "feederId"],
  ["areaId"],
  ["startTime", "expectedRestoration"],
  ["reason", "description"],
  [],
];

const REASONS = ["Load shedding", "Planned maintenance", "Infrastructure maintenance"].map((r) => ({ value: r, label: r }));

async function loadNetwork() {
  const [zones, substations, feeders, areas] = await Promise.all([getZones(), getSubstations(), getFeeders(), getAreas()]);
  return { zones, substations, feeders, areas };
}

export function ScheduledOutageWizard() {
  const { data, error } = useLoad(loadNetwork);
  if (error) return <p className="text-destructive">{error}</p>;
  if (!data) return <Skeleton className="h-96 w-full" />;
  return <WizardForm {...data} />;
}

interface NetworkProps { zones: Zone[]; substations: Substation[]; feeders: Feeder[]; areas: Area[] }

function WizardForm({ zones, substations, feeders, areas }: NetworkProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const { register, control, setValue, trigger, handleSubmit, formState: { errors, isSubmitting } } = useForm<ScheduledOutageValues>({
    resolver: zodResolver(scheduledOutageSchema),
    defaultValues: {
      zoneId: "", substationId: "", feederId: "", areaId: "", startTime: "", expectedRestoration: "",
      reason: "", description: "", notifyCustomers: getSettings().notifyByDefault,
    },
  });

  const values = useWatch({ control });
  const substationOptions = substations.filter((s) => s.zoneId === values.zoneId).map((s) => ({ value: s.id, label: s.name }));
  const feederOptions = feeders.filter((f) => f.substationId === values.substationId).map((f) => ({ value: f.id, label: f.code }));
  const areaOptions = areas.filter((a) => a.feederId === values.feederId).map((a) => ({ value: a.id, label: `${a.name} (${formatNumber(a.customerCount)} customers)` }));
  const selectedArea = areas.find((a) => a.id === values.areaId);
  const nameOf = (list: { id: string; name?: string; code?: string }[], id?: string) => {
    const item = list.find((x) => x.id === id);
    return item?.name ?? item?.code ?? "-";
  };

  async function next() {
    const ok = await trigger(STEP_FIELDS[step]);
    if (ok) setStep((s) => s + 1);
  }

  async function onSubmit(v: ScheduledOutageValues) {
    try {
      const outage = await createScheduledOutage({
        ...v,
        startTime: new Date(v.startTime).toISOString(),
        expectedRestoration: new Date(v.expectedRestoration).toISOString(),
      });
      toast.success(`Scheduled outage ${outage.id} created.`);
      router.push(`/admin/outages/${outage.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create the outage.");
    }
  }

  const isLast = step === STEPS.length - 1;

  return (
    <>
      <PageHeader title="Schedule an outage" description="Plan load shedding or maintenance in five short steps."
        actions={<Link href="/admin/outages" className={buttonVariants({ variant: "outline", size: "sm" })}><ArrowLeft /> Cancel</Link>} />

      <ol className="mb-6 flex flex-wrap gap-2" aria-label="Steps">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}
            className={cn("flex items-center gap-2 rounded-full border px-3 py-1 text-sm",
              i === step ? "border-primary bg-primary text-primary-foreground" : i < step ? "border-green-300 bg-green-50 text-green-800" : "text-muted-foreground")}>
            {i < step ? <Check className="size-3.5" /> : <span className="font-medium">{i + 1}</span>}
            <span className="hidden sm:inline">{label}</span>
          </li>
        ))}
      </ol>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Step {step + 1}: {STEPS[step]}</CardTitle>
          <CardDescription>
            {["Choose the part of the network that will be switched off.", "Pick the area that will lose power.", "When will power go off and when will it return?", "Why is this outage needed, and should customers be told?", "Check everything before you submit."][step]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form noValidate className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            if (isLast) void handleSubmit(onSubmit)(e);
            else void next();
          }}>
            {step === 0 && (
              <>
                <FormField label="Distribution zone" htmlFor="w-zone" error={errors.zoneId?.message}>
                  <Controller name="zoneId" control={control} render={({ field }) => (
                    <SimpleSelect id="w-zone" value={field.value} placeholder="Choose a zone" invalid={!!errors.zoneId}
                      options={zones.map((z) => ({ value: z.id, label: z.name }))}
                      onChange={(v) => { field.onChange(v); setValue("substationId", ""); setValue("feederId", ""); setValue("areaId", ""); }} />
                  )} />
                </FormField>
                <FormField label="Substation" htmlFor="w-sub" error={errors.substationId?.message}>
                  <Controller name="substationId" control={control} render={({ field }) => (
                    <SimpleSelect id="w-sub" value={field.value} disabled={!values.zoneId} invalid={!!errors.substationId}
                      placeholder={values.zoneId ? "Choose a substation" : "Choose a zone first"} options={substationOptions}
                      onChange={(v) => { field.onChange(v); setValue("feederId", ""); setValue("areaId", ""); }} />
                  )} />
                </FormField>
                <FormField label="Feeder" htmlFor="w-fdr" error={errors.feederId?.message}>
                  <Controller name="feederId" control={control} render={({ field }) => (
                    <SimpleSelect id="w-fdr" value={field.value} disabled={!values.substationId} invalid={!!errors.feederId}
                      placeholder={values.substationId ? "Choose a feeder" : "Choose a substation first"} options={feederOptions}
                      onChange={(v) => { field.onChange(v); setValue("areaId", ""); }} />
                  )} />
                </FormField>
              </>
            )}

            {step === 1 && (
              <FormField label="Affected area" htmlFor="w-area" error={errors.areaId?.message}
                hint={`Areas supplied by feeder ${nameOf(feeders, values.feederId)}`}>
                <Controller name="areaId" control={control} render={({ field }) => (
                  <SimpleSelect id="w-area" value={field.value} placeholder="Choose an area" invalid={!!errors.areaId}
                    options={areaOptions} onChange={field.onChange} />
                )} />
              </FormField>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Start date and time" htmlFor="w-start" error={errors.startTime?.message}>
                  <Input id="w-start" type="datetime-local" aria-invalid={!!errors.startTime} {...register("startTime")} />
                </FormField>
                <FormField label="Expected restoration" htmlFor="w-end" error={errors.expectedRestoration?.message}>
                  <Input id="w-end" type="datetime-local" aria-invalid={!!errors.expectedRestoration} {...register("expectedRestoration")} />
                </FormField>
              </div>
            )}

            {step === 3 && (
              <>
                <FormField label="Reason" htmlFor="w-reason" error={errors.reason?.message}>
                  <Controller name="reason" control={control} render={({ field }) => (
                    <SimpleSelect id="w-reason" value={field.value} placeholder="Choose a reason" invalid={!!errors.reason}
                      options={REASONS} onChange={field.onChange} />
                  )} />
                </FormField>
                <FormField label="Description" htmlFor="w-desc" error={errors.description?.message} hint="This text is shown to customers.">
                  <Textarea id="w-desc" rows={4} aria-invalid={!!errors.description} {...register("description")} />
                </FormField>
                <div className="flex items-start gap-3">
                  <Controller name="notifyCustomers" control={control} render={({ field }) => (
                    <Checkbox id="w-notify" checked={field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                  )} />
                  <div>
                    <Label htmlFor="w-notify">Notify customers in this area</Label>
                    <p className="text-xs text-muted-foreground">
                      {selectedArea ? `${formatNumber(selectedArea.customerCount)} customers live in ${selectedArea.name}.` : ""} They will get an in-app notification.
                    </p>
                  </div>
                </div>
              </>
            )}

            {step === 4 && (
              <dl className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Zone", nameOf(zones, values.zoneId)],
                  ["Substation", nameOf(substations, values.substationId)],
                  ["Feeder", nameOf(feeders, values.feederId)],
                  ["Affected area", nameOf(areas, values.areaId)],
                  ["Start", values.startTime ? formatDateTime(new Date(values.startTime).toISOString()) : "-"],
                  ["Expected restoration", values.expectedRestoration ? formatDateTime(new Date(values.expectedRestoration).toISOString()) : "-"],
                  ["Reason", values.reason ?? "-"],
                  ["Notify customers", values.notifyCustomers ? "Yes" : "No"],
                ].map(([label, value]) => (
                  <div key={label}><dt className="text-sm text-muted-foreground">{label}</dt><dd className="font-medium">{value}</dd></div>
                ))}
                <div className="sm:col-span-2"><dt className="text-sm text-muted-foreground">Description</dt><dd>{values.description}</dd></div>
              </dl>
            )}

            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" disabled={step === 0 || isSubmitting} onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft /> Back
              </Button>
              {isLast ? (
                <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Scheduling..." : "Schedule outage"}</Button>
              ) : (
                <Button type="submit">Next <ArrowRight /></Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
