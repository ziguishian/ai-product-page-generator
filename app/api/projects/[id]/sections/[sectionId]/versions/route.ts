import { listSectionVersions } from "@/lib/services/generation-service";
import { handleRouteError, ok } from "@/lib/utils/route";

export async function GET(
  _request: Request,
  context: { params: { id: string; sectionId: string } },
) {
  try {
    const versions = await listSectionVersions(context.params.sectionId);
    return ok(versions);
  } catch (error) {
    return handleRouteError(error);
  }
}
