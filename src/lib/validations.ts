import { z } from "zod";

// Zod schemas used with React Hook Form. The messages are what the user sees.

// Accepts 01811234567, 01811-234567, 01811 234567, +8801811234567
// (dashes and spaces are ignored before checking the pattern)
const phoneSchema = z
  .string()
  .refine((value) => /^(\+?88)?01[3-9]\d{8}$/.test(value.replace(/[\s-]/g, "")), {
    message: "Enter a valid Bangladeshi mobile number, e.g. 01811-234567.",
  });

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  email: z.email("Please enter a valid email address."),
  subject: z.string().trim().min(3, "Please enter a subject."),
  message: z.string().trim().min(10, "Your message should be at least 10 characters."),
});
export type ContactValues = z.infer<typeof contactSchema>;

export const loginSchema = z.object({
  email: z.email("Please enter a valid email address."),
  password: z.string().min(1, "Please enter your password."),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name."),
    email: z.email("Please enter a valid email address."),
    phone: phoneSchema,
    address: z.string().trim().min(5, "Please enter your address."),
    areaId: z.string().min(1, "Please choose your service area."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

// ---------- Admin: infrastructure ----------

const statusEnum = z.enum(["OPERATIONAL", "MAINTENANCE", "OFFLINE"], {
  error: "Please choose a status.",
});

export const zoneSchema = z.object({
  name: z.string().trim().min(2, "Zone name is required."),
  code: z.string().trim().min(2, "Code must be 2 to 5 characters.").max(5, "Code must be 2 to 5 characters."),
  description: z.string().trim().min(5, "Add a short description."),
  status: statusEnum,
});
export type ZoneValues = z.infer<typeof zoneSchema>;

export const substationSchema = z.object({
  name: z.string().trim().min(2, "Substation name is required."),
  code: z.string().trim().min(3, "Code must be at least 3 characters."),
  zoneId: z.string().min(1, "Please choose a distribution zone."),
  capacityMVA: z
    .number({ error: "Enter the capacity as a number." })
    .positive("Capacity must be more than 0.")
    .max(1000, "Capacity looks too high."),
  status: statusEnum,
});
export type SubstationValues = z.infer<typeof substationSchema>;

export const feederSchema = z.object({
  code: z.string().trim().min(3, "Feeder code must be at least 3 characters."),
  substationId: z.string().min(1, "Please choose a substation."),
  capacityMW: z
    .number({ error: "Enter the capacity as a number." })
    .positive("Capacity must be more than 0.")
    .max(500, "Capacity looks too high."),
  status: statusEnum,
});
export type FeederValues = z.infer<typeof feederSchema>;

export const areaSchema = z.object({
  name: z.string().trim().min(2, "Area name is required."),
  code: z.string().trim().min(2, "Area code is required."),
  zoneId: z.string().min(1, "Please choose a distribution zone."),
  substationId: z.string().min(1, "Please choose a substation."),
  feederId: z.string().min(1, "Please choose a feeder."),
  customerCount: z
    .number({ error: "Enter the customer count as a number." })
    .int("Use a whole number.")
    .min(0, "Customer count cannot be negative."),
});
export type AreaValues = z.infer<typeof areaSchema>;

// ---------- Admin: outages ----------

export const scheduledOutageSchema = z
  .object({
    zoneId: z.string().min(1, "Please choose a distribution zone."),
    substationId: z.string().min(1, "Please choose a substation."),
    feederId: z.string().min(1, "Please choose a feeder."),
    areaId: z.string().min(1, "Please choose the affected area."),
    startTime: z.string().min(1, "Choose a start date and time."),
    expectedRestoration: z.string().min(1, "Choose the expected restoration time."),
    reason: z.string().min(1, "Please choose a reason."),
    description: z.string().trim().min(10, "Describe the outage in at least 10 characters."),
    notifyCustomers: z.boolean(),
  })
  .refine((d) => !d.startTime || !d.expectedRestoration || d.expectedRestoration > d.startTime, {
    message: "Restoration time must be after the start time.",
    path: ["expectedRestoration"],
  });
export type ScheduledOutageValues = z.infer<typeof scheduledOutageSchema>;

export const assignSchema = z.object({
  technicianId: z.string().min(1, "Please choose a technician."),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], { error: "Please choose a priority." }),
  estimatedHours: z
    .number({ error: "Enter the estimated hours as a number." })
    .min(1, "Estimate at least 1 hour.")
    .max(72, "Estimate cannot be more than 72 hours."),
});
export type AssignValues = z.infer<typeof assignSchema>;

// ---------- Users & profile ----------

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name."),
  phone: phoneSchema,
  address: z.string().trim().min(5, "Please enter your address."),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const userSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter the full name."),
    email: z.email("Please enter a valid email address."),
    phone: phoneSchema,
    password: z.string().min(6, "Password must be at least 6 characters."),
    role: z.enum(["ADMIN", "CUSTOMER", "TECHNICIAN"], { error: "Please choose a role." }),
    areaId: z.string(),
    zoneId: z.string(),
  })
  .superRefine((d, ctx) => {
    if (d.role === "CUSTOMER" && !d.areaId) {
      ctx.addIssue({ code: "custom", path: ["areaId"], message: "Please choose the customer's area." });
    }
    if (d.role === "TECHNICIAN" && !d.zoneId) {
      ctx.addIssue({ code: "custom", path: ["zoneId"], message: "Please choose the technician's zone." });
    }
  });
export type UserValues = z.infer<typeof userSchema>;

// ---------- Customer ----------

export const reportSchema = z.object({
  category: z.enum(["NO_POWER", "PARTIAL_POWER", "VOLTAGE_FLUCTUATION", "DAMAGED_LINE", "TRANSFORMER_PROBLEM", "OTHER"], {
    error: "Please choose the type of problem.",
  }),
  location: z.string().trim().min(5, "Please describe where the problem is (house, road, landmark)."),
  description: z.string().trim().min(10, "Please describe the problem in at least 10 characters."),
  problemStart: z
    .string()
    .min(1, "Please tell us when the problem started.")
    .refine((v) => !v || new Date(v).getTime() <= Date.now(), "The start time cannot be in the future."),
  contactName: z.string().trim().min(2, "Please enter a contact name."),
  contactPhone: phoneSchema,
});
export type ReportValues = z.infer<typeof reportSchema>;

export const customerProfileSchema = profileSchema.extend({
  areaId: z.string().min(1, "Please choose your service area."),
});
export type CustomerProfileValues = z.infer<typeof customerProfileSchema>;

// ---------- Technician ----------

export const repairNoteSchema = z.object({
  note: z.string().trim().min(5, "Please write a note of at least 5 characters."),
  progress: z
    .number({ error: "Enter the progress as a number." })
    .int("Use a whole number.")
    .min(0, "Progress cannot be below 0%.")
    .max(99, "Use 99% or less. Submit the completion form to finish the job."),
});
export type RepairNoteValues = z.infer<typeof repairNoteSchema>;

export const completionSchema = z.object({
  summary: z.string().trim().min(10, "Please summarise the repair in at least 10 characters."),
});
export type CompletionValues = z.infer<typeof completionSchema>;
