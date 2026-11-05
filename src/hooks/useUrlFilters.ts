"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Keeps search / filter / sort / page state in the URL, for example
// /admin/outages?page=2&type=UNEXPECTED&status=ACTIVE
// Components using this hook must be wrapped in <Suspense>.
export function useUrlFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function get(key: string, fallback = ""): string {
    return searchParams.get(key) ?? fallback;
  }

  // Change one or more query parameters. Empty values remove the parameter.
  // Changing any filter (anything except "page") sends the user back to page 1.
  function setParams(changes: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === "" || value === "ALL") params.delete(key);
      else params.set(key, value);
    }
    if (!("page" in changes)) params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function clearAll() {
    router.replace(pathname, { scroll: false });
  }

  const page = Math.max(1, Number(searchParams.get("page")) || 1);

  return { get, setParams, clearAll, page, hasFilters: searchParams.size > 0 };
}
