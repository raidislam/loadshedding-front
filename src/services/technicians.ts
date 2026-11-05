import { delay } from "@/lib/delay";
import { nextId } from "@/lib/ids";
import { addActivity, outagesStore, techniciansStore } from "@/services/store";
import { applyOutageStatus } from "@/services/outages";
import type { Availability, Outage, OutageStatus, Technician } from "@/types";

export async function getTechnicians(): Promise<Technician[]> {
  await delay();
  return techniciansStore.load();
}

export async function getTechnicianByUserId(userId: string): Promise<Technician | undefined> {
  await delay(250);
  return techniciansStore.load().find((t) => t.userId === userId);
}

// All jobs assigned to one technician (open and finished).
export async function getTechnicianJobs(technicianId: string): Promise<Outage[]> {
  await delay();
  return outagesStore
    .load()
    .filter((o) => o.technicianId === technicianId)
    .sort((a, b) => (b.assignedAt ?? "").localeCompare(a.assignedAt ?? ""));
}

export async function setAvailability(technicianId: string, availability: Availability): Promise<Technician> {
  await delay(400);
  const list = techniciansStore.load();
  const tech = list.find((t) => t.id === technicianId);
  if (!tech) throw new Error("Technician not found.");
  tech.availability = availability;
  techniciansStore.save(list);
  return tech;
}

// Technician accepts an assignment. The status stays ASSIGNED until work starts.
export async function acceptAssignment(outageId: string, technicianName: string): Promise<void> {
  await delay(500);
  const outages = outagesStore.load();
  const outage = outages.find((o) => o.id === outageId);
  if (!outage) throw new Error("Job not found.");
  outage.acceptedAt = new Date().toISOString();
  outage.repairNotes.push({
    id: nextId("note", outage.repairNotes.map((n) => n.id)),
    note: "Assignment accepted.",
    progress: outage.progress,
    createdAt: outage.acceptedAt,
    author: technicianName,
  });
  outagesStore.save(outages);
  addActivity(`${technicianName} accepted ${outage.id}`);
}

export interface RepairUpdateInput {
  author: string;
  note?: string;
  progress?: number;
  evidenceFiles?: string[]; // file names only
  summary?: string;
  status?: OutageStatus; // IN_PROGRESS or REPAIR_COMPLETED
}

// One function for every technician action: start repair, add note,
// upload evidence, submit completion.
export async function updateRepairProgress(outageId: string, input: RepairUpdateInput): Promise<Outage> {
  await delay(700);
  const outages = outagesStore.load();
  const outage = outages.find((o) => o.id === outageId);
  if (!outage) throw new Error("Job not found.");

  if (input.progress !== undefined) outage.progress = input.progress;
  if (input.evidenceFiles?.length) {
    outage.evidenceFiles = [...outage.evidenceFiles, ...input.evidenceFiles];
  }
  if (input.summary) outage.completionSummary = input.summary;
  if (input.note) {
    outage.repairNotes.push({
      id: nextId("note", outage.repairNotes.map((n) => n.id)),
      note: input.note,
      progress: outage.progress,
      createdAt: new Date().toISOString(),
      author: input.author,
    });
  }
  outagesStore.save(outages);

  if (input.status) {
    const noteText =
      input.status === "IN_PROGRESS" ? "Technician started the repair."
      : input.status === "REPAIR_COMPLETED" ? "Repair completed."
      : undefined;
    return applyOutageStatus(outageId, input.status, noteText);
  }
  return outage;
}

// Keeps the technician record (used by admins when assigning) in step with the user's profile.
export async function updateTechnicianContact(technicianId: string, patch: { name: string; phone: string }): Promise<void> {
  await delay(200);
  const list = techniciansStore.load();
  const tech = list.find((t) => t.id === technicianId);
  if (!tech) return;
  tech.name = patch.name;
  tech.phone = patch.phone;
  techniciansStore.save(list);
}
