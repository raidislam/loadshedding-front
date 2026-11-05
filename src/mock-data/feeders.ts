import type { Feeder } from "@/types";

export const feeders: Feeder[] = [
  { id: "fdr-1", code: "MIR-01", substationId: "sub-1", capacityMW: 18, status: "OPERATIONAL" },
  { id: "fdr-2", code: "MIR-02", substationId: "sub-1", capacityMW: 15, status: "OPERATIONAL" },
  { id: "fdr-3", code: "UTT-01", substationId: "sub-2", capacityMW: 16, status: "OPERATIONAL" },
  { id: "fdr-4", code: "DHA-01", substationId: "sub-3", capacityMW: 14, status: "OPERATIONAL" },
  { id: "fdr-5", code: "MOT-01", substationId: "sub-4", capacityMW: 20, status: "MAINTENANCE" },
  { id: "fdr-6", code: "AGR-01", substationId: "sub-5", capacityMW: 12, status: "OPERATIONAL" },
  { id: "fdr-7", code: "RAJ-01", substationId: "sub-6", capacityMW: 10, status: "OPERATIONAL" },
];
