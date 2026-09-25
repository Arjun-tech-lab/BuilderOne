import { api, setToken } from "@/lib/api";
import type { AuthResponse, User } from "@/types";

export async function register(payload: {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string;
  role: "CUSTOMER" | "BUILDER";
}): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setToken(data.access_token);
  localStorage.setItem("builderone_user", JSON.stringify(data.user));
  return data;
}

export async function login(payload: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setToken(data.access_token);
  localStorage.setItem("builderone_user", JSON.stringify(data.user));
  return data;
}

export async function logout(): Promise<void> {
  try {
    await api("/api/auth/logout", { method: "POST" });
  } catch {
    /* ignore */
  }
  setToken(null);
  localStorage.removeItem("builderone_user");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("builderone_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export async function fetchMe(): Promise<User> {
  const user = await api<User>("/api/auth/me");
  localStorage.setItem("builderone_user", JSON.stringify(user));
  return user;
}
