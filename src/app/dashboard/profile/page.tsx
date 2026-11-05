import type { Metadata } from "next";
import { CustomerProfile } from "@/components/customer/CustomerProfile";

export const metadata: Metadata = { title: "My Profile" };

// Content comes from browser-only demo data, so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return <CustomerProfile />;
}
