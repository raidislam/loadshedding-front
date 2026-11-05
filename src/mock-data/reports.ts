import type { OutageReport } from "@/types";
import { daysFromNow, hoursFromNow } from "@/mock-data/helpers";

export const reports: OutageReport[] = [
  {
    id: "REP-2001", customerId: "user-cust-1", areaId: "area-1", category: "NO_POWER",
    location: "House 12, Road 4, Mirpur 10",
    description: "Power went out suddenly. Neighbours on our road are also affected. We heard a loud sound from the transformer at the corner.",
    problemStart: hoursFromNow(-5), contactName: "Nusrat Jahan", contactPhone: "01811-234567",
    status: "IN_PROGRESS", outageId: "OUT-1006", technicianId: "tech-1", estimatedRestoration: hoursFromNow(3),
    createdAt: hoursFromNow(-4.9),
    timeline: [
      { status: "REPORTED", at: hoursFromNow(-4.9), note: "Report submitted by customer." },
      { status: "ASSIGNED", at: hoursFromNow(-4), note: "Technician Karim Uddin assigned." },
      { status: "IN_PROGRESS", at: hoursFromNow(-3), note: "Technician started the repair." },
    ],
  },
  {
    id: "REP-2002", customerId: "user-cust-1", areaId: "area-1", category: "TRANSFORMER_PROBLEM",
    location: "Road 4, Mirpur 10", description: "The transformer keeps tripping every few minutes and the lights flicker.",
    problemStart: daysFromNow(-10, 8), contactName: "Nusrat Jahan", contactPhone: "01811-234567",
    status: "RESTORED", outageId: "OUT-1007", technicianId: "tech-1", estimatedRestoration: daysFromNow(-10, 13),
    createdAt: daysFromNow(-10, 8, 10),
    timeline: [
      { status: "REPORTED", at: daysFromNow(-10, 8, 10), note: "Report submitted by customer." },
      { status: "ASSIGNED", at: daysFromNow(-10, 8, 30), note: "Technician Karim Uddin assigned." },
      { status: "IN_PROGRESS", at: daysFromNow(-10, 9), note: "Technician started the repair." },
      { status: "REPAIR_COMPLETED", at: daysFromNow(-10, 12), note: "Repair completed." },
      { status: "RESTORED", at: daysFromNow(-10, 12, 30), note: "Power restored." },
    ],
  },
  {
    id: "REP-2003", customerId: "user-cust-2", areaId: "area-5", category: "DAMAGED_LINE",
    location: "Road 12, Sector 7, Uttara", description: "A tree branch fell on the electric line near our building and power is out.",
    problemStart: hoursFromNow(-2), contactName: "Rafiq Hossain", contactPhone: "01911-345678",
    status: "ASSIGNED", outageId: "OUT-1008", technicianId: "tech-2", estimatedRestoration: hoursFromNow(5),
    createdAt: hoursFromNow(-1.9),
    timeline: [
      { status: "REPORTED", at: hoursFromNow(-1.9), note: "Report submitted by customer." },
      { status: "ASSIGNED", at: hoursFromNow(-1), note: "Technician Habibur Rahman assigned." },
    ],
  },
  {
    id: "REP-2004", customerId: "user-cust-3", areaId: "area-6", category: "VOLTAGE_FLUCTUATION",
    location: "House 27, Road 8, Dhanmondi", description: "The voltage is very low in the evening and our fridge and AC keep switching off.",
    problemStart: hoursFromNow(-3), contactName: "Sabina Akter", contactPhone: "01611-456789",
    status: "REPORTED", createdAt: hoursFromNow(-2.5),
    timeline: [{ status: "REPORTED", at: hoursFromNow(-2.5), note: "Report submitted by customer." }],
  },
  {
    id: "REP-2005", customerId: "user-cust-2", areaId: "area-5", category: "PARTIAL_POWER",
    location: "Flat 5B, Sector 7, Uttara", description: "Only half of the lights in our flat are working. The meter display looks normal.",
    problemStart: hoursFromNow(-1), contactName: "Rafiq Hossain", contactPhone: "01911-345678",
    status: "REPORTED", createdAt: hoursFromNow(-0.8),
    timeline: [{ status: "REPORTED", at: hoursFromNow(-0.8), note: "Report submitted by customer." }],
  },
  {
    id: "REP-2006", customerId: "user-cust-3", areaId: "area-6", category: "NO_POWER",
    location: "House 27, Road 8, Dhanmondi", description: "Power cut since the evening. Nearby houses are also dark.",
    problemStart: daysFromNow(-1, 18), contactName: "Sabina Akter", contactPhone: "01611-456789",
    status: "REPAIR_COMPLETED", outageId: "OUT-1009", technicianId: "tech-3", estimatedRestoration: daysFromNow(0, 1),
    createdAt: daysFromNow(-1, 18, 10),
    timeline: [
      { status: "REPORTED", at: daysFromNow(-1, 18, 10), note: "Report submitted by customer." },
      { status: "ASSIGNED", at: daysFromNow(-1, 18, 30), note: "Technician Shamim Reza assigned." },
      { status: "IN_PROGRESS", at: daysFromNow(-1, 19), note: "Technician started the repair." },
      { status: "REPAIR_COMPLETED", at: hoursFromNow(-2), note: "Repair completed. Waiting for restoration check." },
    ],
  },
  {
    id: "REP-2007", customerId: "user-cust-2", areaId: "area-5", category: "PARTIAL_POWER",
    location: "Road 9, Sector 7, Uttara", description: "Only two phases are working on our street.",
    problemStart: daysFromNow(-6, 14), contactName: "Rafiq Hossain", contactPhone: "01911-345678",
    status: "RESTORED", outageId: "OUT-1010", technicianId: "tech-2", estimatedRestoration: daysFromNow(-6, 19),
    createdAt: daysFromNow(-6, 14, 10),
    timeline: [
      { status: "REPORTED", at: daysFromNow(-6, 14, 10), note: "Report submitted by customer." },
      { status: "ASSIGNED", at: daysFromNow(-6, 14, 20), note: "Technician Habibur Rahman assigned." },
      { status: "IN_PROGRESS", at: daysFromNow(-6, 15), note: "Technician started the repair." },
      { status: "REPAIR_COMPLETED", at: daysFromNow(-6, 17, 30), note: "Repair completed." },
      { status: "RESTORED", at: daysFromNow(-6, 18), note: "Power restored." },
    ],
  },
  {
    id: "REP-2008", customerId: "user-cust-3", areaId: "area-6", category: "DAMAGED_LINE",
    location: "Road 6, Dhanmondi 27", description: "A storm broke the wire near our gate and the area is dark.",
    problemStart: daysFromNow(-15, 20), contactName: "Sabina Akter", contactPhone: "01611-456789",
    status: "RESTORED", outageId: "OUT-1011", technicianId: "tech-3", estimatedRestoration: daysFromNow(-15, 23),
    createdAt: daysFromNow(-15, 20, 5),
    timeline: [
      { status: "REPORTED", at: daysFromNow(-15, 20, 5), note: "Report submitted by customer." },
      { status: "ASSIGNED", at: daysFromNow(-15, 20, 15), note: "Technician Shamim Reza assigned." },
      { status: "IN_PROGRESS", at: daysFromNow(-15, 20, 45), note: "Technician started the repair." },
      { status: "REPAIR_COMPLETED", at: daysFromNow(-15, 22, 30), note: "Repair completed." },
      { status: "RESTORED", at: daysFromNow(-15, 22, 40), note: "Power restored." },
    ],
  },
];
