import { apiClient } from "./client";
import type {
  Finding,
  FindingReviewRequest,
} from "@/types/api";

export async function getFinding(findingId: string): Promise<Finding> {
  const res = await apiClient.get<Finding>(`/findings/${findingId}`);
  return res.data;
}

export async function reviewFinding(
  findingId: string,
  data: FindingReviewRequest,
): Promise<{ finding: Finding }> {
  const res = await apiClient.post<{ finding: Finding }>(
    `/findings/${findingId}/review`,
    data,
  );
  return res.data;
}
