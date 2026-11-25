import type { Metadata } from "next";
import { CustomerOverview } from "@/components/customer/CustomerOverview";

export const metadata: Metadata = { title: "Dashboard" };

// Data is loaded in the browser with the logged-in user's session, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return <CustomerOverview />;
}
