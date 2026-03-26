import { z } from "zod";

export const providerInputSchema = z.object({
  name: z.string().trim().min(2, "请输入 Provider 名称"),
  baseUrl: z.string().trim().url("请输入有效的 baseURL"),
  apiKey: z.string().trim().optional().default(""),
});

export const providerSaveSchema = providerInputSchema.extend({
  id: z.string().optional(),
  isActive: z.boolean().default(true),
  defaultAssignments: z
    .object({
      analysisModelId: z.string().optional().nullable(),
      planningModelId: z.string().optional().nullable(),
      heroImageModelId: z.string().optional().nullable(),
      detailImageModelId: z.string().optional().nullable(),
      imageEditModelId: z.string().optional().nullable(),
    })
    .optional(),
});
