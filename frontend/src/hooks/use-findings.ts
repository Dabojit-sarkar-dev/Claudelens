import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFinding, reviewFinding } from "@/api/findings";
import type { FindingReviewRequest } from "@/types/api";

export function useFinding(findingId: string | undefined) {
  return useQuery({
    queryKey: ["findings", findingId],
    queryFn: () => getFinding(findingId!),
    enabled: !!findingId,
    staleTime: 15_000,
  });
}

export function useReviewFinding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      findingId,
      data,
    }: {
      findingId: string;
      data: FindingReviewRequest;
    }) => reviewFinding(findingId, data),
    onSuccess: (result) => {
      // Update the finding in the cache
      queryClient.setQueryData(
        ["findings", result.finding.id],
        result.finding,
      );
      // Invalidate related contract findings
      queryClient.invalidateQueries({
        queryKey: ["contracts", result.finding.document_id, "findings"],
      });
    },
  });
}
