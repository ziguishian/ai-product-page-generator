import { z } from "zod";

import { sectionTypes } from "@/types/domain";

export const sectionInputSchema = z.object({
  id: z.string().optional(),
  type: z.enum(sectionTypes),
  title: z.string().min(1, "标题不能为空"),
  goal: z.string().min(1, "目标不能为空"),
  copy: z.string().default(""),
  visualPrompt: z.string().default(""),
  editableFields: z.record(z.string(), z.any()).default({}),
});

export const sectionPatchSchema = z.object({
  type: z.enum(sectionTypes).optional(),
  title: z.string().optional(),
  goal: z.string().optional(),
  copy: z.string().optional(),
  visualPrompt: z.string().optional(),
  status: z.enum(["IDLE", "QUEUED", "GENERATING", "SUCCESS", "FAILED"]).optional(),
  editableData: z.record(z.string(), z.any()).optional(),
});

export const sectionReorderSchema = z.object({
  orderedSectionIds: z.array(z.string()).min(1),
});
