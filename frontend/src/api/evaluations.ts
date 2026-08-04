import { apiClient } from "./client";
import type {
  Evaluation,
  EvaluationListParams,
  PaginatedResponse,
  EvaluationRunRequest,
} from "@/types/api";

export async function runEvaluation(
  data: EvaluationRunRequest,
): Promise<Evaluation> {
  const res = await apiClient.post<Evaluation>("/evaluations/run", data);
  return res.data;
}

export async function listEvaluations(
  params?: EvaluationListParams,
): Promise<PaginatedResponse<Evaluation>> {
  const res = await apiClient.get<PaginatedResponse<Evaluation>>("/evaluations", {
    params,
  });
  return res.data;
}

export async function getEvaluation(
  evaluationId: string,
): Promise<Evaluation> {
  const res = await apiClient.get<Evaluation>(
    `/evaluations/${evaluationId}`,
  );
  return res.data;
}
