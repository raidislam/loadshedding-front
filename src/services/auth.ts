import { delay } from "@/lib/delay";
import { readStorage, writeStorage } from "@/lib/storage";
import { users as seedUsers } from "@/mock-data/users";
import type { User } from "@/types";

// DEMO AUTHENTICATION ONLY.
// Users and the session live in localStorage, so anyone can edit them in the
// browser. A real app must check credentials on a server.

const USERS_KEY = "ls_users";

// Seed users plus any user created on the register page.
export function getAllUsers(): User[] {
  return readStorage<User[] | null>(USERS_KEY, null) ?? structuredClone(seedUsers);
}

export function saveAllUsers(list: User[]) {
  writeStorage(USERS_KEY, list);
}

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<User> {
  await delay(500);
  const found = getAllUsers().find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!found || found.password !== password) {
    throw new Error("Email or password is incorrect.");
  }
  if (!found.active) {
    throw new Error("This account has been deactivated.");
  }
  return found;
}

export async function getUserById(id: string): Promise<User | undefined> {
  await delay(200);
  return getAllUsers().find((u) => u.id === id);
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  address: string;
  areaId: string;
}

// Registration always creates a CUSTOMER. Admin and technician accounts are
// created by an admin in the User Management page.
export async function registerCustomer(input: RegisterInput): Promise<User> {
  await delay(600);
  const all = getAllUsers();
  if (all.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const newUser: User = {
    id: `user-cust-${Date.now()}`,
    name: input.name,
    email: input.email,
    password: input.password,
    phone: input.phone,
    role: "CUSTOMER",
    address: input.address,
    areaId: input.areaId,
    customerNumber: `DN-${Math.floor(100000 + Math.random() * 900000)}`,
    createdAt: new Date().toISOString(),
    active: true,
  };
  saveAllUsers([...all, newUser]);
  return newUser;
}

export async function updateUser(
  id: string,
  patch: Partial<Omit<User, "id" | "role">>,
): Promise<User> {
  await delay(500);
  const all = getAllUsers();
  const index = all.findIndex((u) => u.id === id);
  if (index === -1) throw new Error("User not found.");
  const updated = { ...all[index], ...patch };
  all[index] = updated;
  saveAllUsers(all);
  return updated;
}
