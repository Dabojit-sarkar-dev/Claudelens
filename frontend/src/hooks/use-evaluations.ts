import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listEvaluations,
  getEvaluation,
  runEvaluation,
} from "@/api/evaluations";
import type { EvaluationListParams, EvaluationRunRequest } from "@/types/api";

export function useEvaluations(params?: EvaluationListParams) {
  return useQuery({
    queryKey: ["evaluations", params],
    queryFn: () => listEvaluations(params),
    staleTime: 30_000,
  });
}

export function useEvaluation(evaluationId: string | undefined) {
  return useQuery({
    queryKey: ["evaluations", evaluationId],
    queryFn: () => getEvaluation(evaluationId!),
    enabled: !!evaluationId,
    staleTime: 60_000,
  });
}

export function useRunEvaluation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EvaluationRunRequest) => runEvaluation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["evaluations"] });
    },
  });
}
