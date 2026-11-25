"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FormField } from "@/components/shared/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactValues } from "@/lib/validations";

export const SUPPORT_EMAIL = "support@powergrid.demo";

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) });

  // The backend has no contact endpoint, so we don't pretend to send anything.
  // Instead the visitor's own email app opens with the message already filled in.
  function onSubmit(values: ContactValues) {
    const body = `${values.message}

- ${values.name} (${values.email})`;
    window.location.assign(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`);
    toast.info("Your email app has been opened with this message. Press send there.");
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" aria-invalid={!!errors.name} {...register("name")} />
        </FormField>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
        </FormField>
      </div>
      <FormField label="Subject" htmlFor="subject" error={errors.subject?.message}>
        <Input id="subject" aria-invalid={!!errors.subject} {...register("subject")} />
      </FormField>
      <FormField label="Message" htmlFor="message" error={errors.message?.message}>
        <Textarea id="message" rows={5} aria-invalid={!!errors.message} {...register("message")} />
      </FormField>
      <Button type="submit" size="lg" className="h-10 px-4">
        Open in email app
      </Button>
    </form>
  );
}
