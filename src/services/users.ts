import { delay } from "@/lib/delay";
import { nextId } from "@/lib/ids";
import { getAllUsers, saveAllUsers } from "@/services/auth";
import { addActivity, techniciansStore } from "@/services/store";
import type { Role, Technician, User } from "@/types";

export async function getUsers(): Promise<User[]> {
  await delay();
  return getAllUsers();
}

export interface NewUserInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  areaId: string; // customers
  zoneId: string; // technicians
}

// Admin creates a user of any role. A technician user also gets a technician record.
export async function createUser(input: NewUserInput): Promise<User> {
  await delay(700);
  const all = getAllUsers();
  if (all.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("A user with this email already exists.");
  }
  const prefix = input.role === "ADMIN" ? "user-admin" : input.role === "CUSTOMER" ? "user-cust" : "user-tech";
  const user: User = {
    id: nextId(prefix, all.filter((u) => u.id.startsWith(prefix)).map((u) => u.id)),
    name: input.name,
    email: input.email,
    password: input.password,
    phone: input.phone,
    role: input.role,
    areaId: input.role === "CUSTOMER" ? input.areaId : undefined,
    customerNumber: input.role === "CUSTOMER" ? `DN-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
    createdAt: new Date().toISOString(),
    active: true,
  };
  saveAllUsers([...all, user]);

  if (input.role === "TECHNICIAN") {
    const techs = techniciansStore.load();
    const tech: Technician = {
      id: nextId("tech", techs.map((t) => t.id)),
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      zoneId: input.zoneId,
      availability: "AVAILABLE",
      specialty: "General repairs",
      employeeId: `EMP-${3100 + techs.length + 1}`,
    };
    techniciansStore.save([...techs, tech]);
  }
  addActivity(`New ${input.role.toLowerCase()} account created for ${user.name}`);
  return user;
}

export async function setUserActive(id: string, active: boolean): Promise<void> {
  await delay(500);
  const all = getAllUsers();
  const user = all.find((u) => u.id === id);
  if (!user) throw new Error("User not found.");
  user.active = active;
  saveAllUsers(all);
  addActivity(`Account of ${user.name} was ${active ? "activated" : "deactivated"}`);
}
