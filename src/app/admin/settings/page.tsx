import type { Metadata } from "next";
import { AccountProfile } from "@/components/shared/AccountProfile";

export const metadata: Metadata = { title: "Settings" };

// The profile is loaded in the browser (logged-in user), so skip the dev-only instant-navigation check.
export const instant = false;

export default function Page() {
  return <AccountProfile title="Settings" />;
}
