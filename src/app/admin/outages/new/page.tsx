import type { Metadata } from "next";
import { ScheduledOutageWizard } from "@/components/admin/ScheduledOutageWizard";

export const metadata: Metadata = { title: "Create Outage" };

// Data is loaded in the browser with the logged-in admin's session, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return <ScheduledOutageWizard />;
}
