"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/layout/AuthProvider";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { FormField } from "@/components/shared/FormField";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { getSettings, saveSettings } from "@/lib/settings";
import { profileSchema, type ProfileValues } from "@/lib/validations";
import { resetDemoData } from "@/services/store";
import type { User } from "@/types";

export function AdminSettings() {
  const { user } = useAuth();
  if (!user) return <Skeleton className="h-64 w-full" />;
  return (
    <>
      <PageHeader title="Settings" description="Your profile and demo preferences." />
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileCard user={user} />
        <div className="space-y-6">
          <PreferencesCard />
          <ResetCard />
        </div>
      </div>
    </>
  );
}

function ProfileCard({ user }: { user: User }) {
  const { updateProfile } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name, phone: user.phone, address: user.address ?? "" },
  });

  async function onSubmit(values: ProfileValues) {
    try {
      await updateProfile(values);
      toast.success("Profile updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update the profile.");
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Admin profile</CardTitle><CardDescription>{user.email}</CardDescription></CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <FormField label="Full name" htmlFor="s-name" error={errors.name?.message}>
            <Input id="s-name" aria-invalid={!!errors.name} {...register("name")} />
          </FormField>
          <FormField label="Mobile number" htmlFor="s-phone" error={errors.phone?.message}>
            <Input id="s-phone" type="tel" aria-invalid={!!errors.phone} {...register("phone")} />
          </FormField>
          <FormField label="Office address" htmlFor="s-address" error={errors.address?.message}>
            <Input id="s-address" aria-invalid={!!errors.address} {...register("address")} />
          </FormField>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save profile"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

function PreferencesCard() {
  const [settings, setSettings] = useState(getSettings);

  function save() {
    if (!Number.isFinite(settings.defaultRepairHours) || settings.defaultRepairHours < 1 || settings.defaultRepairHours > 72) {
      toast.error("Enter a repair time between 1 and 72 hours.");
      return;
    }
    saveSettings(settings);
    toast.success("Preferences saved in this browser.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Defaults</CardTitle>
        <CardDescription>Used to pre-fill forms. Saved in this browser only.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Label htmlFor="pref-notify">Notify customers by default</Label>
            <p className="text-xs text-muted-foreground">Ticks the notification box when scheduling an outage.</p>
          </div>
          <Switch id="pref-notify" checked={settings.notifyByDefault}
            onCheckedChange={(c) => setSettings({ ...settings, notifyByDefault: c })} />
        </div>
        <FormField label="Default repair estimate (hours)" htmlFor="pref-hours" hint="Pre-filled when you assign a technician.">
          <Input id="pref-hours" type="number" value={Number.isNaN(settings.defaultRepairHours) ? "" : settings.defaultRepairHours}
            onChange={(e) => setSettings({ ...settings, defaultRepairHours: e.target.valueAsNumber })} />
        </FormField>
        <Button onClick={save}>Save defaults</Button>
      </CardContent>
    </Card>
  );
}

function ResetCard() {
  const [open, setOpen] = useState(false);

  function reset() {
    resetDemoData();
    toast.success("Demo data has been reset.");
    setTimeout(() => window.location.reload(), 600);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Demo data</CardTitle>
        <CardDescription>Everything you change is stored in this browser. Reset to start again with the original sample data.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive" onClick={() => setOpen(true)}><RotateCcw /> Reset demo data</Button>
      </CardContent>
      <ConfirmDialog open={open} onOpenChange={setOpen} destructive title="Reset all demo data?" confirmLabel="Reset data" onConfirm={reset}
        description="Zones, outages, reports, notifications and any accounts you registered will return to the original sample data." />
    </Card>
  );
}
