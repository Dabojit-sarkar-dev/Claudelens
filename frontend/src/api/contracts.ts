import { apiClient } from "./client";
import type {
  Contract,
  ContractListParams,
  PaginatedResponse,
  FindingListParams,
  Finding,
} from "@/types/api";

export async function listContracts(
  params?: ContractListParams,
): Promise<PaginatedResponse<Contract>> {
  const res = await apiClient.get<PaginatedResponse<Contract>>("/contracts", {
    params,
  });
  return res.data;
}

export async function getContract(
  contractId: string,
): Promise<Contract> {
  const res = await apiClient.get<Contract>(`/contracts/${contractId}`);
  return res.data;
}

export async function uploadContract(
  file: File,
  workspaceId: string,
  title?: string,
): Promise<Contract> {
  const form = new FormData();
  form.append("file", file);
  form.append("workspace_id", workspaceId);
  if (title) form.append("title", title);

  const res = await apiClient.post<Contract>("/contracts", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}


export async function listContractFindings(
  contractId: string,
  params?: FindingListParams,
): Promise<PaginatedResponse<Finding>> {
  const res = await apiClient.get<PaginatedResponse<Finding>>(
    `/contracts/${contractId}/findings`,
    { params },
  );
  return res.data;
}

export async function reprocessContract(
  contractId: string,
): Promise<{ success: boolean }> {
  const res = await apiClient.post<{ success: boolean }>(
    `/contracts/${contractId}/reprocess`,
  );
  return res.data;
}
