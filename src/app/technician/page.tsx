import type { Metadata } from "next";
import { TechnicianOverview } from "@/components/technician/TechnicianOverview";

export const metadata: Metadata = { title: "Technician Dashboard" };

// Content comes from browser-only demo data, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return <TechnicianOverview />;
}
