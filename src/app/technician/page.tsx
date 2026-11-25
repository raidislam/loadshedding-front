import type { Metadata } from "next";
import { TechnicianOverview } from "@/components/technician/TechnicianOverview";

export const metadata: Metadata = { title: "Technician Dashboard" };

// Data is loaded in the browser with the logged-in technician's session, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return <TechnicianOverview />;
}
