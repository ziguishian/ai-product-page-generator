import { NextRequest } from "next/server";

import { deleteSection, updateSection } from "@/lib/services/planner-service";
import { sectionPatchSchema } from "@/lib/validations/section";
import { handleRouteError, ok } from "@/lib/utils/route";

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string; sectionId: string } },
) {
  try {
    const input = sectionPatchSchema.parse(await request.json());
    const payload: Record<string, unknown> = { ...input };
    if (input.type) {
      payload.type = input.type.toUpperCase();
    }
    if (input.editableData) {
      payload.editableData = input.editableData;
    }
    const section = await updateSection(context.params.sectionId, payload);
    return ok(section);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: { id: string; sectionId: string } },
) {
  try {
    const section = await deleteSection(context.params.sectionId);
    return ok(section);
  } catch (error) {
    return handleRouteError(error);
  }
}
