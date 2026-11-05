import type { Metadata } from "next";
import { AdminSettings } from "@/components/admin/AdminSettings";

export const metadata: Metadata = { title: "Settings" };

// Content comes from browser-only demo data, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return <AdminSettings />;
}
