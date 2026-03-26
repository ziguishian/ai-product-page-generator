import { deleteAssetRecord } from "@/lib/storage/asset-manager";
import { handleRouteError, ok } from "@/lib/utils/route";

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  try {
    const asset = await deleteAssetRecord(context.params.id);
    return ok(asset);
  } catch (error) {
    return handleRouteError(error);
  }
}
