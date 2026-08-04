import { useQuery } from "@tanstack/react-query";
import { listWorkspaces } from "@/api/workspaces";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: listWorkspaces,
    staleTime: 10 * 60 * 1000,
  });
}
