import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const uploadContractSchema = z.object({
  file: z.instanceof(File, { message: "Please select a file" }),
  workspace_id: z.string().min(1, "Workspace is required"),
  title: z.string().optional(),
});

export type UploadContractFormValues = z.infer<typeof uploadContractSchema>;

export const reviewFindingSchema = z
  .object({
    action: z.enum(["approve", "edit", "reject", "request_reprocess"]),
    rationale: z.string().optional(),
    value: z.record(z.string(), z.unknown()).optional(),
  })
  .refine(
    (data) => {
      if (data.action === "edit" || data.action === "reject") {
        return data.rationale && data.rationale.trim().length > 0;
      }
      return true;
    },
    {
      message: "Rationale is required for edit and reject actions",
      path: ["rationale"],
    },
  );

export type ReviewFindingFormValues = z.infer<typeof reviewFindingSchema>;

export const runEvaluationSchema = z.object({
  name: z.string().optional(),
  document_ids: z.array(z.string()).optional(),
});

export type RunEvaluationFormValues = z.infer<typeof runEvaluationSchema>;
