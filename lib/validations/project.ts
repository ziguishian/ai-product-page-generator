import { z } from "zod";

import { platformOptions, styleOptions } from "@/types/domain";

export const projectCreateSchema = z.object({
  name: z.string().trim().min(2, "项目名称至少 2 个字符"),
  platform: z.enum(platformOptions),
  style: z.enum(styleOptions),
  description: z.string().trim().optional().nullable(),
});

export const projectUpdateSchema = projectCreateSchema.partial().extend({
  status: z
    .enum(["DRAFT", "ANALYZED", "PLANNED", "EDITING", "COMPLETED"])
    .optional(),
  modelSnapshot: z.record(z.string(), z.any()).optional(),
});
