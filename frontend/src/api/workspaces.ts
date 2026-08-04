import { apiClient } from "./client";
import type { Workspace } from "@/types/api";

export async function listWorkspaces(): Promise<Workspace[]> {
  const res = await apiClient.get<Workspace[]>("/workspaces");
  return res.data;
}
