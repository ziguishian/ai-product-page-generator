import { activateSectionVersion } from "@/lib/services/generation-service";
import { handleRouteError, ok } from "@/lib/utils/route";

export async function PATCH(
  _request: Request,
  context: { params: { id: string; sectionId: string; versionId: string } },
) {
  try {
    const version = await activateSectionVersion(context.params.sectionId, context.params.versionId);
    return ok(version);
  } catch (error) {
    return handleRouteError(error);
  }
}
