import type { Metadata } from "next";
import { CustomerOverview } from "@/components/customer/CustomerOverview";

export const metadata: Metadata = { title: "Dashboard" };

// Content comes from browser-only demo data, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return <CustomerOverview />;
}
