import { z } from "zod";

const sectionPlanItemSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  goal: z.string(),
  copy: z.string(),
  visualPrompt: z.string(),
  editableFields: z.record(z.string(), z.any()).default({}),
});

export const sectionPlanOutputSchema = z
  .union([
    z.object({
      sections: z.array(sectionPlanItemSchema),
    }),
    z.array(sectionPlanItemSchema),
    z.object({
      data: z.object({
        sections: z.array(sectionPlanItemSchema),
      }),
    }),
    z.object({
      result: z.object({
        sections: z.array(sectionPlanItemSchema),
      }),
    }),
  ])
  .transform((value) => {
    if (Array.isArray(value)) {
      return { sections: value };
    }
    if ("sections" in value) {
      return { sections: value.sections };
    }
    if ("data" in value) {
      return { sections: value.data.sections };
    }
    return { sections: value.result.sections };
  });

export type SectionPlanOutput = z.infer<typeof sectionPlanOutputSchema>;
