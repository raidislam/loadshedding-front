import type { ActivityLog, Notification } from "@/types";
import { daysFromNow, hoursFromNow } from "@/mock-data/helpers";

export const notifications: Notification[] = [
  { id: "notif-1", userId: "user-cust-1", type: "SCHEDULED_OUTAGE", title: "Load shedding scheduled tomorrow", message: "Mirpur 10 will have planned load shedding tomorrow from 10:00 AM to 2:00 PM.", createdAt: hoursFromNow(-6), read: false },
  { id: "notif-2", userId: "user-cust-1", type: "UNEXPECTED_OUTAGE", title: "Power outage in Mirpur 10", message: "An unexpected outage is affecting your area. A repair team has been informed.", createdAt: hoursFromNow(-4.8), read: false },
  { id: "notif-3", userId: "user-cust-1", type: "ASSIGNMENT", title: "Technician assigned to your report", message: "Karim Uddin has been assigned to report REP-2001.", createdAt: hoursFromNow(-4), read: false },
  { id: "notif-4", userId: "user-cust-1", type: "ASSIGNMENT", title: "Repair work has started", message: "The technician has started repairing the transformer in your area.", createdAt: hoursFromNow(-3), read: true },
  { id: "notif-5", userId: "user-cust-1", type: "RESTORATION", title: "Power restored in Mirpur 10", message: "Power has been restored for your report REP-2002. Thank you for your patience.", createdAt: daysFromNow(-10, 12, 30), read: true },
  { id: "notif-6", userId: "user-cust-2", type: "UNEXPECTED_OUTAGE", title: "Power outage in Uttara Sector 7", message: "A damaged line is causing an outage. A technician has been assigned.", createdAt: hoursFromNow(-1), read: false },
  { id: "notif-7", userId: "user-cust-2", type: "SCHEDULED_OUTAGE", title: "Maintenance scheduled in 2 days", message: "Planned maintenance on the UTT-01 feeder, 2:00 PM to 5:00 PM.", createdAt: hoursFromNow(-20), read: true },
  { id: "notif-8", userId: "user-cust-3", type: "RESTORATION", title: "Repair completed in Dhanmondi 27", message: "The repair for report REP-2006 is complete. Power will be confirmed shortly.", createdAt: hoursFromNow(-2), read: false },
];

export const activities: ActivityLog[] = [
  { id: "act-1", message: "Critical outage OUT-1012 created in Shewrapara and assigned to Karim Uddin", createdAt: hoursFromNow(-0.5) },
  { id: "act-2", message: "New customer report REP-2005 received from Uttara Sector 7", createdAt: hoursFromNow(-0.8) },
  { id: "act-3", message: "Technician Habibur Rahman assigned to OUT-1008", createdAt: hoursFromNow(-1) },
  { id: "act-4", message: "Scheduled outage OUT-1003 started in Motijheel Commercial Area", createdAt: hoursFromNow(-1) },
  { id: "act-5", message: "Repair completed on OUT-1009 by Shamim Reza", createdAt: hoursFromNow(-2) },
  { id: "act-6", message: "New customer report REP-2004 received from Dhanmondi 27", createdAt: hoursFromNow(-2.5) },
  { id: "act-7", message: "Karim Uddin started repair on OUT-1006", createdAt: hoursFromNow(-3) },
  { id: "act-8", message: "Scheduled outage OUT-1004 created for Kazipara", createdAt: daysFromNow(-2, 10) },
];
