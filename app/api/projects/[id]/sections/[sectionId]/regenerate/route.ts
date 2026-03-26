import { NextRequest } from "next/server";

import { regenerateSectionImage } from "@/lib/services/generation-service";
import { generationRequestSchema } from "@/lib/validations/generation";
import { handleRouteError, ok } from "@/lib/utils/route";

export async function POST(
  request: NextRequest,
  context: { params: { id: string; sectionId: string } },
) {
  try {
    const input = generationRequestSchema.parse(await request.json().catch(() => ({})));
    const result = await regenerateSectionImage(
      context.params.id,
      context.params.sectionId,
      input.modelId,
      input.referenceAssetIds,
    );
    return ok(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
