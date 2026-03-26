import { NextRequest } from "next/server";

import { createSection } from "@/lib/services/planner-service";
import { sectionInputSchema } from "@/lib/validations/section";
import { handleRouteError, ok } from "@/lib/utils/route";

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const input = sectionInputSchema.parse(await request.json());
    const section = await createSection(context.params.id, input);
    return ok(section, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
