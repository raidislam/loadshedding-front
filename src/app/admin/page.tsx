import type { Metadata } from "next";
import { AdminOverview } from "@/components/admin/AdminOverview";

export const metadata: Metadata = { title: "Admin Overview" };

// Data is loaded in the browser with the logged-in user's session, so skip the dev-only instant-navigation check.
export const instant = false;

export default function AdminPage() {
  return <AdminOverview />;
}
