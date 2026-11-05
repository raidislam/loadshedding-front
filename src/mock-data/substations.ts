import type { Substation } from "@/types";

export const substations: Substation[] = [
  { id: "sub-1", name: "Mirpur", code: "SS-MIR", zoneId: "zone-1", capacityMVA: 120, status: "OPERATIONAL" },
  { id: "sub-2", name: "Uttara", code: "SS-UTT", zoneId: "zone-1", capacityMVA: 100, status: "OPERATIONAL" },
  { id: "sub-3", name: "Dhanmondi", code: "SS-DHA", zoneId: "zone-2", capacityMVA: 90, status: "OPERATIONAL" },
  { id: "sub-4", name: "Motijheel", code: "SS-MOT", zoneId: "zone-2", capacityMVA: 110, status: "MAINTENANCE" },
  { id: "sub-5", name: "Agrabad", code: "SS-AGR", zoneId: "zone-3", capacityMVA: 80, status: "OPERATIONAL" },
  { id: "sub-6", name: "Rajshahi Sadar", code: "SS-RAJ", zoneId: "zone-4", capacityMVA: 60, status: "OPERATIONAL" },
];
