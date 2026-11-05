"use client";

import { useCallback } from "react";
import { useRequiredUser } from "@/components/layout/AuthProvider";
import { useLoad } from "@/hooks/useLoad";
import { getAreas } from "@/services/areas";
import { getTechnicianByUserId, getTechnicianJobs } from "@/services/technicians";
import { getZones } from "@/services/zones";

// Loads the logged-in technician's record, their jobs, and the area / zone names
// that the job screens need. Used by the overview, jobs and history pages.
export function useTechnicianJobs() {
  const user = useRequiredUser();
  const loader = useCallback(async () => {
    const technician = await getTechnicianByUserId(user.id);
    const [jobs, areas, zones] = await Promise.all([
      technician ? getTechnicianJobs(technician.id) : Promise.resolve([]),
      getAreas(),
      getZones(),
    ]);
    return { technician, jobs, areas, zones };
  }, [user.id]);
  return useLoad(loader);
}
