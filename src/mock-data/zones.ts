import type { Zone } from "@/types";

export const zones: Zone[] = [
  { id: "zone-1", name: "Dhaka North", code: "DN", description: "Northern Dhaka including Mirpur, Uttara and Gulshan side areas.", status: "OPERATIONAL", createdAt: "2024-01-15T09:00:00.000Z" },
  { id: "zone-2", name: "Dhaka South", code: "DS", description: "Old and central Dhaka including Dhanmondi, Motijheel and Jatrabari.", status: "OPERATIONAL", createdAt: "2024-01-15T09:00:00.000Z" },
  { id: "zone-3", name: "Chattogram", code: "CTG", description: "Chattogram city and the port area.", status: "MAINTENANCE", createdAt: "2024-02-20T09:00:00.000Z" },
  { id: "zone-4", name: "Rajshahi", code: "RAJ", description: "Rajshahi city and surrounding areas.", status: "OPERATIONAL", createdAt: "2024-03-10T09:00:00.000Z" },
];
