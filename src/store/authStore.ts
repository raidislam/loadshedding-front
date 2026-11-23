import { create } from "zustand";
import type { User } from "@/types/api";

// Global state for the logged-in user (Zustand).
// The tokens are NOT stored here: they live in httpOnly cookies.
interface AuthState {
  user: User | null;
  ready: boolean; // false until we know whether someone is logged in
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  ready: false,
  setUser: (user) => set({ user, ready: true }),
}));
