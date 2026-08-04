import { apiClient } from "./client";
import type { User } from "@/types/api";

export async function login(data: any): Promise<{ access_token: string }> {
  const res = await apiClient.post<{ access_token: string }>("/auth/login", data);
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await apiClient.get<User>("/auth/me");
  return res.data;
}
