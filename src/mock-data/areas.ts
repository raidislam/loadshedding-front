import type { Area } from "@/types";

// Every area points to its zone, substation and feeder by ID.
export const areas: Area[] = [
  { id: "area-1", name: "Mirpur 10", code: "MIR-10", zoneId: "zone-1", substationId: "sub-1", feederId: "fdr-1", customerCount: 4200 },
  { id: "area-2", name: "Mirpur 11", code: "MIR-11", zoneId: "zone-1", substationId: "sub-1", feederId: "fdr-1", customerCount: 3600 },
  { id: "area-3", name: "Kazipara", code: "KAZ", zoneId: "zone-1", substationId: "sub-1", feederId: "fdr-2", customerCount: 2800 },
  { id: "area-4", name: "Shewrapara", code: "SHE", zoneId: "zone-1", substationId: "sub-1", feederId: "fdr-2", customerCount: 3100 },
  { id: "area-5", name: "Uttara Sector 7", code: "UTT-07", zoneId: "zone-1", substationId: "sub-2", feederId: "fdr-3", customerCount: 3900 },
  { id: "area-6", name: "Dhanmondi 27", code: "DHA-27", zoneId: "zone-2", substationId: "sub-3", feederId: "fdr-4", customerCount: 2500 },
  { id: "area-7", name: "Motijheel Commercial Area", code: "MOT-CA", zoneId: "zone-2", substationId: "sub-4", feederId: "fdr-5", customerCount: 1800 },
  { id: "area-8", name: "Agrabad", code: "AGR", zoneId: "zone-3", substationId: "sub-5", feederId: "fdr-6", customerCount: 3300 },
  { id: "area-9", name: "Boalia", code: "BOA", zoneId: "zone-4", substationId: "sub-6", feederId: "fdr-7", customerCount: 2700 },
];
