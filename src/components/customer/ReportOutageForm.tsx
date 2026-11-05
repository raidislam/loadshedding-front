"use client";

import { useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
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
import { OUTAGE_STATUS, REPORT_CATEGORY_LABEL } from "@/constants/statuses";
import { reportSchema, type ReportValues } from "@/lib/validations";
import { createOutageReport } from "@/services/reports";
import type { OutageReport, ReportCategory } from "@/types";

const MAX_IMAGE_MB = 5;
const categoryOptions = Object.entries(REPORT_CATEGORY_LABEL).map(([value, label]) => ({ value, label }));

export function ReportOutageForm() {
  const user = useRequiredUser();
  const [submitted, setSubmitted] = useState<OutageReport | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imageError, setImageError] = useState("");

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ReportValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      location: user.address ?? "", description: "", problemStart: "",
      contactName: user.name, contactPhone: user.phone,
    },
  });

  function handleImage(file: File | undefined) {
    setImageError("");
    if (!file) { setImage(null); return; }
    if (!file.type.startsWith("image/")) { setImageError("Please choose an image file (JPG, PNG or WebP)."); setImage(null); return; }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) { setImageError(`The image must be smaller than ${MAX_IMAGE_MB} MB.`); setImage(null); return; }
    setImage(file);
  }

  async function onSubmit(values: ReportValues) {
    if (!user.areaId) {
      toast.error("Please choose your service area in your profile first.");
      return;
    }
    try {
      const report = await createOutageReport({
        ...values,
        customerId: user.id,
        areaId: user.areaId,
        problemStart: new Date(values.problemStart).toISOString(),
        imageName: image?.name, // demo: only the file name is kept, nothing is uploaded
      });
      toast.success(`Report ${report.id} submitted.`);
      setSubmitted(report);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not submit your report.");
    }
  }

  function another() {
    reset();
    setImage(null);
    setSubmitted(null);
  }

  if (submitted) {
    return (
      <>
        <PageHeader title="Report an outage" />
        <Card className="max-w-xl">
          <CardContent className="space-y-4 text-center">
            <CheckCircle2 className="mx-auto size-12 text-green-600" />
            <div>
              <p className="text-lg font-semibold">Thank you, your report was received</p>
              <p className="text-sm text-muted-foreground">Keep this report number to follow the repair.</p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">Report ID</p>
              <p className="text-2xl font-bold text-primary">{submitted.id}</p>
              <div className="mt-2"><StatusBadge {...OUTAGE_STATUS[submitted.status]} /></div>
            </div>
            <p className="text-sm text-muted-foreground">The control room will review your report and assign a technician. You will get a notification at each step.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/dashboard/my-reports" className={buttonVariants()}>Track my reports</Link>
              <Button variant="outline" onClick={another}>Report another problem</Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Report an outage" description="Tell us what is wrong with your electricity supply." />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Problem details</CardTitle>
          <CardDescription>Fields marked with an asterisk are required in the form. Reports in the demo are saved in this browser only.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <FormField label="What is the problem? *" htmlFor="r-category" error={errors.category?.message}>
              <Controller name="category" control={control} render={({ field }) => (
                <SimpleSelect id="r-category" value={field.value ?? ""} placeholder="Choose the type of problem"
                  invalid={!!errors.category} options={categoryOptions} onChange={(v) => field.onChange(v as ReportCategory)} />
              )} />
            </FormField>
            <FormField label="Location *" htmlFor="r-location" error={errors.location?.message} hint="House number, road and a nearby landmark help the technician find you.">
              <Input id="r-location" aria-invalid={!!errors.location} {...register("location")} />
            </FormField>
            <FormField label="Description *" htmlFor="r-desc" error={errors.description?.message}>
              <Textarea id="r-desc" rows={4} aria-invalid={!!errors.description} {...register("description")} />
            </FormField>
            <FormField label="When did the problem start? *" htmlFor="r-start" error={errors.problemStart?.message}>
              <Input id="r-start" type="datetime-local" aria-invalid={!!errors.problemStart} {...register("problemStart")} />
            </FormField>
            <FormField label="Photo (optional)" htmlFor="r-image" error={imageError} hint={image ? `Selected: ${image.name} (${(image.size / 1024).toFixed(0)} KB)` : `JPG, PNG or WebP, up to ${MAX_IMAGE_MB} MB. In this demo only the file name is saved.`}>
              <Input id="r-image" type="file" accept="image/*" onChange={(e) => handleImage(e.target.files?.[0])} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Contact name *" htmlFor="r-cname" error={errors.contactName?.message}>
                <Input id="r-cname" aria-invalid={!!errors.contactName} {...register("contactName")} />
              </FormField>
              <FormField label="Contact phone *" htmlFor="r-cphone" error={errors.contactPhone?.message}>
                <Input id="r-cphone" type="tel" aria-invalid={!!errors.contactPhone} {...register("contactPhone")} />
              </FormField>
            </div>
            <Button type="submit" size="lg" className="h-10 px-4" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit report"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
