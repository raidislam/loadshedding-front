import type { Metadata } from "next";
import { ReportOutageForm } from "@/components/customer/ReportOutageForm";

export const metadata: Metadata = { title: "Report Outage" };

// Data is loaded in the browser with the logged-in user's session, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return <ReportOutageForm />;
}
