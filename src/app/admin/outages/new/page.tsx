import type { Metadata } from "next";
import { ScheduledOutageWizard } from "@/components/admin/ScheduledOutageWizard";

export const metadata: Metadata = { title: "Schedule Outage" };

// Content comes from browser-only demo data, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return <ScheduledOutageWizard />;
}
