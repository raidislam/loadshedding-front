import { z } from "zod";

// Zod schemas used with React Hook Form. The messages are what the user sees.

// Accepts 01811234567, 01811-234567, 01811 234567, +8801811234567
// and turns it into "01811234567", the only format the backend accepts.
export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s-]/g, "").replace(/^\+?88/, ""))
  .pipe(z.string().regex(/^01[3-9]\d{8}$/, "Enter a valid Bangladeshi mobile number, e.g. 01811-234567."));

// Same rule as the backend: 8-64 characters, at least one letter and one number
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(64, "Password cannot be longer than 64 characters.")
  .regex(/[A-Za-z]/, "Password must contain at least one letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

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
    name: z.string().trim().min(2, "Please enter your full name.").max(100, "Name is too long."),
    email: z.email("Please enter a valid email address."),
    phone: phoneSchema,
    address: z.string().trim().min(3, "Please enter your address.").max(255, "Address is too long."),
    areaId: z.string().min(1, "Please choose your service area."),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

// ---------- Admin: infrastructure ----------

// Same rules as the backend: name 2-100 characters; code 2-20 of A-Z, 0-9 or "-", stored in UPPERCASE
const nameField = (what: string) =>
  z.string().trim().min(2, `${what} name must be at least 2 characters.`).max(100, `${what} name is too long.`);

const codeField = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z0-9-]{2,20}$/, "Code must be 2-20 characters: letters, numbers or '-'.");

// Optional positive number typed into a text box ("" = not set)
const optionalPositive = (label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || (Number.isFinite(Number(v)) && Number(v) > 0), `${label} must be a number greater than 0.`);

export const zoneSchema = z.object({
  name: nameField("Zone"),
  code: codeField,
  description: z.string().trim().max(500, "Description cannot be longer than 500 characters."),
});
export type ZoneValues = z.infer<typeof zoneSchema>;

export const substationSchema = z.object({
  name: nameField("Substation"),
  code: codeField,
  zoneId: z.string().min(1, "Please choose a distribution zone."),
  capacityMW: optionalPositive("Capacity"),
  address: z.string().trim().max(255, "Address is too long."),
});
export type SubstationValues = z.infer<typeof substationSchema>;

export const feederSchema = z.object({
  name: nameField("Feeder"),
  code: codeField,
  zoneId: z.string(), // only used to filter the substation dropdown
  substationId: z.string().min(1, "Please choose a substation."),
  voltageKV: optionalPositive("Voltage"),
});
export type FeederValues = z.infer<typeof feederSchema>;

export const areaSchema = z.object({
  name: nameField("Area"),
  code: codeField,
  zoneId: z.string(), // zone and substation only filter the dropdowns below them
  substationId: z.string(),
  feederId: z.string().min(1, "Please choose a feeder."),
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

// Empty is allowed (field left blank), otherwise it must be a valid BD number
const optionalPhoneSchema = z.union([z.literal(""), phoneSchema]);

// PATCH /users/me. meterNumber and areaId are only used for customers.
export const profileSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(100, "Name is too long."),
  phone: optionalPhoneSchema,
  address: z
    .string()
    .trim()
    .max(255, "Address is too long.")
    .refine((v) => v === "" || v.length >= 3, "Address is too short."),
  meterNumber: z
    .string()
    .trim()
    .refine((v) => v === "" || (v.length >= 5 && v.length <= 20), "Meter number must be 5-20 characters."),
  areaId: z.string(),
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Please enter your current password."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm the new password."),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { message: "Passwords do not match.", path: ["confirmPassword"] })
  .refine((d) => d.newPassword !== d.currentPassword, {
    message: "New password must be different from the current one.",
    path: ["newPassword"],
  });
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

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
