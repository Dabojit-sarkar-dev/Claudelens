import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listContracts,
  getContract,
  uploadContract,
  listContractFindings,
  reprocessContract,
} from "@/api/contracts";
import type { ContractListParams, FindingListParams } from "@/types/api";

export function useContracts(params?: ContractListParams) {
  return useQuery({
    queryKey: ["contracts", params],
    queryFn: () => listContracts(params),
    staleTime: 30_000,
  });
}

export function useContract(contractId: string | undefined) {
  return useQuery({
    queryKey: ["contracts", contractId],
    queryFn: () => getContract(contractId!),
    enabled: !!contractId,
    staleTime: 30_000,
  });
}

export function useContractFindings(
  contractId: string | undefined,
  params?: FindingListParams,
) {
  return useQuery({
    queryKey: ["contracts", contractId, "findings", params],
    queryFn: () => listContractFindings(contractId!, params),
    enabled: !!contractId,
    staleTime: 30_000,
  });
}

export function useUploadContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      workspaceId,
      title,
    }: {
      file: File;
      workspaceId: string;
      title?: string;
    }) => uploadContract(file, workspaceId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}

export function useReprocessContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contractId: string) => reprocessContract(contractId),
    onSuccess: (_data, contractId) => {
      queryClient.invalidateQueries({ queryKey: ["contracts", contractId] });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
    },
  });
}
