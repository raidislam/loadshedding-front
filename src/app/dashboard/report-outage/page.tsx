import type { Metadata } from "next";
import { ReportOutageForm } from "@/components/customer/ReportOutageForm";

export const metadata: Metadata = { title: "Report Outage" };

// Content comes from browser-only demo data, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return <ReportOutageForm />;
}
