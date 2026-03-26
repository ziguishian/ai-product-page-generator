import { NextRequest } from "next/server";

import { reorderSections } from "@/lib/services/planner-service";
import { sectionReorderSchema } from "@/lib/validations/section";
import { handleRouteError, ok } from "@/lib/utils/route";

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const input = sectionReorderSchema.parse(await request.json());
    const sections = await reorderSections(context.params.id, input.orderedSectionIds);
    return ok(sections);
  } catch (error) {
    return handleRouteError(error);
  }
}
