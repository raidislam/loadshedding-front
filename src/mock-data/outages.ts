import type { Outage } from "@/types";
import { areas } from "@/mock-data/areas";
import { daysFromNow, hoursFromNow } from "@/mock-data/helpers";

// Looks up zone / substation / feeder from the area so the IDs always match.
function place(areaId: string) {
  const area = areas.find((a) => a.id === areaId);
  if (!area) throw new Error(`Unknown area ${areaId}`);
  return {
    areaId,
    zoneId: area.zoneId,
    substationId: area.substationId,
    feederId: area.feederId,
  };
}

export const outages: Outage[] = [
  // ----- Scheduled outages -----
  {
    id: "OUT-1001", type: "SCHEDULED", status: "SCHEDULED", priority: "LOW", ...place("area-1"),
    startTime: daysFromNow(1, 10), expectedRestoration: daysFromNow(1, 14),
    reason: "Load shedding", description: "Rotational load shedding to manage demand across the Mirpur feeders.",
    progress: 0, repairNotes: [], evidenceFiles: [], createdAt: daysFromNow(-1, 9),
  },
  {
    id: "OUT-1002", type: "SCHEDULED", status: "SCHEDULED", priority: "MEDIUM", ...place("area-5"),
    startTime: daysFromNow(2, 14), expectedRestoration: daysFromNow(2, 17),
    reason: "Planned maintenance", description: "Replacement of ageing insulators on the UTT-01 feeder.",
    progress: 0, repairNotes: [], evidenceFiles: [], createdAt: daysFromNow(-1, 11),
  },
  {
    id: "OUT-1003", type: "SCHEDULED", status: "ACTIVE", priority: "LOW", ...place("area-7"),
    startTime: hoursFromNow(-1), expectedRestoration: hoursFromNow(2),
    reason: "Load shedding", description: "Scheduled load shedding in the Motijheel commercial area.",
    progress: 0, repairNotes: [], evidenceFiles: [], createdAt: daysFromNow(-1, 15),
  },
  {
    id: "OUT-1004", type: "SCHEDULED", status: "SCHEDULED", priority: "MEDIUM", ...place("area-3"),
    startTime: daysFromNow(3, 9), expectedRestoration: daysFromNow(3, 13),
    reason: "Infrastructure maintenance", description: "Tree trimming near overhead lines on the MIR-02 feeder.",
    progress: 0, repairNotes: [], evidenceFiles: [], createdAt: daysFromNow(-2, 10),
  },
  {
    id: "OUT-1005", type: "SCHEDULED", status: "COMPLETED", priority: "LOW", ...place("area-8"),
    startTime: daysFromNow(-3, 10), expectedRestoration: daysFromNow(-3, 13), restoredAt: daysFromNow(-3, 13),
    reason: "Load shedding", description: "Scheduled load shedding in Agrabad.",
    progress: 100, repairNotes: [], evidenceFiles: [], createdAt: daysFromNow(-5, 10),
  },

  // ----- Unexpected outages (customer reports) -----
  {
    id: "OUT-1006", type: "UNEXPECTED", status: "IN_PROGRESS", priority: "HIGH", ...place("area-1"),
    startTime: hoursFromNow(-5), expectedRestoration: hoursFromNow(3),
    reason: "Transformer fault", description: "Complete power failure in Mirpur 10. Loud noise heard from the road-side transformer.",
    reportId: "REP-2001", technicianId: "tech-1", assignedAt: hoursFromNow(-4), acceptedAt: hoursFromNow(-3.8),
    progress: 45,
    repairNotes: [
      { id: "note-1", note: "Reached the site. The transformer fuse has blown and the oil level is low.", progress: 20, createdAt: hoursFromNow(-3), author: "Karim Uddin" },
      { id: "note-2", note: "Old fuse removed. Waiting for the replacement transformer part from the Mirpur depot.", progress: 45, createdAt: hoursFromNow(-1.5), author: "Karim Uddin" },
    ],
    evidenceFiles: ["transformer-fuse.jpg"], createdAt: hoursFromNow(-5),
  },
  {
    id: "OUT-1007", type: "UNEXPECTED", status: "RESTORED", priority: "MEDIUM", ...place("area-1"),
    startTime: daysFromNow(-10, 8), expectedRestoration: daysFromNow(-10, 13), restoredAt: daysFromNow(-10, 12, 30),
    reason: "Transformer problem", description: "Frequent tripping of the local transformer in Mirpur 10.",
    reportId: "REP-2002", technicianId: "tech-1", assignedAt: daysFromNow(-10, 8, 30), acceptedAt: daysFromNow(-10, 8, 40),
    progress: 100,
    repairNotes: [{ id: "note-3", note: "Loose connection tightened and the load balanced across phases.", progress: 100, createdAt: daysFromNow(-10, 12), author: "Karim Uddin" }],
    evidenceFiles: ["repair-photo.jpg"],
    completionSummary: "Loose connection on the transformer terminal repaired. Load tested for 30 minutes with no tripping.",
    createdAt: daysFromNow(-10, 8),
  },
  {
    id: "OUT-1008", type: "UNEXPECTED", status: "ASSIGNED", priority: "HIGH", ...place("area-5"),
    startTime: hoursFromNow(-2), expectedRestoration: hoursFromNow(5),
    reason: "Damaged power line", description: "A tree branch fell on the overhead line in Uttara Sector 7.",
    reportId: "REP-2003", technicianId: "tech-2", assignedAt: hoursFromNow(-1),
    progress: 0, repairNotes: [], evidenceFiles: [], createdAt: hoursFromNow(-2),
  },
  {
    id: "OUT-1009", type: "UNEXPECTED", status: "REPAIR_COMPLETED", priority: "MEDIUM", ...place("area-6"),
    startTime: daysFromNow(-1, 18), expectedRestoration: daysFromNow(0, 1),
    reason: "No power", description: "Power cut in part of Dhanmondi 27 after a cable fault.",
    reportId: "REP-2006", technicianId: "tech-3", assignedAt: daysFromNow(-1, 18, 30), acceptedAt: daysFromNow(-1, 18, 40),
    progress: 100,
    repairNotes: [{ id: "note-4", note: "Damaged cable section replaced and tested.", progress: 100, createdAt: hoursFromNow(-2), author: "Shamim Reza" }],
    evidenceFiles: ["cable-joint.jpg"],
    completionSummary: "Faulty underground cable joint replaced. Waiting for the admin to confirm restoration.",
    createdAt: daysFromNow(-1, 18),
  },
  {
    id: "OUT-1010", type: "UNEXPECTED", status: "RESTORED", priority: "MEDIUM", ...place("area-5"),
    startTime: daysFromNow(-6, 14), expectedRestoration: daysFromNow(-6, 19), restoredAt: daysFromNow(-6, 18),
    reason: "Partial power loss", description: "Two phases were dead on a street in Uttara Sector 7.",
    reportId: "REP-2007", technicianId: "tech-2", assignedAt: daysFromNow(-6, 14, 20), acceptedAt: daysFromNow(-6, 14, 30),
    progress: 100,
    repairNotes: [{ id: "note-5", note: "Burnt jumper replaced on the pole.", progress: 100, createdAt: daysFromNow(-6, 17, 30), author: "Habibur Rahman" }],
    evidenceFiles: [], completionSummary: "Burnt jumper wire replaced and all three phases checked.",
    createdAt: daysFromNow(-6, 14),
  },
  {
    id: "OUT-1011", type: "UNEXPECTED", status: "RESTORED", priority: "HIGH", ...place("area-6"),
    startTime: daysFromNow(-15, 20), expectedRestoration: daysFromNow(-15, 23), restoredAt: daysFromNow(-15, 22, 40),
    reason: "Damaged power line", description: "Storm damage to the overhead line in Dhanmondi 27.",
    reportId: "REP-2008", technicianId: "tech-3", assignedAt: daysFromNow(-15, 20, 15), acceptedAt: daysFromNow(-15, 20, 25),
    progress: 100,
    repairNotes: [{ id: "note-6", note: "Broken line reconnected and the pole checked.", progress: 100, createdAt: daysFromNow(-15, 22, 30), author: "Shamim Reza" }],
    evidenceFiles: ["storm-damage.jpg"], completionSummary: "Broken overhead line spliced and re-tensioned.",
    createdAt: daysFromNow(-15, 20),
  },
  {
    id: "OUT-1012", type: "UNEXPECTED", status: "ASSIGNED", priority: "CRITICAL", ...place("area-4"),
    startTime: hoursFromNow(-1), expectedRestoration: hoursFromNow(6),
    reason: "Transformer fault", description: "Substation control room reported a feeder trip affecting Shewrapara. About 3,100 customers are without power.",
    technicianId: "tech-1", assignedAt: hoursFromNow(-0.5),
    progress: 0, repairNotes: [], evidenceFiles: [], createdAt: hoursFromNow(-1),
  },
];
