"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DEMO_USER_IDS } from "@/mock-data/users";
import { readStorage, removeStorage, writeStorage } from "@/lib/storage";
import {
  getAllUsers,
  loginWithCredentials,
  updateUser as updateUserService,
} from "@/services/auth";
import type { Role, User } from "@/types";

// The session is just the logged-in user's id saved in localStorage.
const SESSION_KEY = "ls_session";

// --- tiny store so React re-renders when the session changes ---
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback); // other browser tabs
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function getSessionId(): string | null {
  return readStorage<string | null>(SESSION_KEY, null);
}

function setSessionId(id: string | null) {
  if (id) writeStorage(SESSION_KEY, id);
  else removeStorage(SESSION_KEY);
  listeners.forEach((l) => l());
}

interface AuthContextValue {
  user: User | null;
  ready: boolean; // false until the browser has read the saved session
  login: (email: string, password: string) => Promise<User>;
  loginAs: (role: Role) => User;
  logout: () => void;
  updateProfile: (patch: Partial<Omit<User, "id" | "role">>) => Promise<User>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const sessionId = useSyncExternalStore(subscribe, getSessionId, () => null);
  // Server render: false. After hydration in the browser: true.
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  // Bumped after a profile edit so `user` is looked up again.
  const [version, setVersion] = useState(0);

  const user = useMemo(() => {
    void version;
    if (!sessionId) return null;
    return getAllUsers().find((u) => u.id === sessionId) ?? null;
  }, [sessionId, version]);

  const login = useCallback(async (email: string, password: string) => {
    const found = await loginWithCredentials(email, password);
    setSessionId(found.id);
    return found;
  }, []);

  const loginAs = useCallback((role: Role) => {
    const id = DEMO_USER_IDS[role];
    const found = getAllUsers().find((u) => u.id === id);
    if (!found) throw new Error("Demo user not found.");
    setSessionId(found.id);
    return found;
  }, []);

  const logout = useCallback(() => setSessionId(null), []);

  const updateProfile = useCallback(
    async (patch: Partial<Omit<User, "id" | "role">>) => {
      if (!sessionId) throw new Error("Not logged in.");
      const updated = await updateUserService(sessionId, patch);
      setVersion((v) => v + 1);
      return updated;
    },
    [sessionId],
  );

  const value = useMemo(
    () => ({ user, ready, login, loginAs, logout, updateProfile }),
    [user, ready, login, loginAs, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// For pages inside a dashboard layout. The layout only renders them when someone is
// logged in with the right role, so the user is always there.
export function useRequiredUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error("useRequiredUser must be used on a page that needs login");
  return user;
}
