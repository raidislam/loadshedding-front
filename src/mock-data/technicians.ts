import type { Technician } from "@/types";

export const technicians: Technician[] = [
  { id: "tech-1", userId: "user-tech-1", name: "Karim Uddin", email: "technician@powergrid.demo", phone: "01712-111222", zoneId: "zone-1", availability: "BUSY", specialty: "Transformer repair", employeeId: "EMP-3101" },
  { id: "tech-2", userId: "user-tech-2", name: "Habibur Rahman", email: "habib@powergrid.demo", phone: "01713-222333", zoneId: "zone-1", availability: "BUSY", specialty: "Overhead line repair", employeeId: "EMP-3102" },
  { id: "tech-3", userId: "user-tech-3", name: "Shamim Reza", email: "shamim@powergrid.demo", phone: "01714-333444", zoneId: "zone-2", availability: "AVAILABLE", specialty: "Underground cable repair", employeeId: "EMP-3103" },
];
