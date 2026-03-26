import { prisma } from "@/lib/db/prisma";
import { handleRouteError, ok } from "@/lib/utils/route";

export async function PATCH(_request: Request, context: { params: { id: string } }) {
  try {
    const asset = await prisma.productAsset.findUnique({
      where: { id: context.params.id },
    });

    if (!asset) {
      throw new Error("Asset not found.");
    }

    await prisma.productAsset.updateMany({
      where: {
        projectId: asset.projectId,
        type: "MAIN",
      },
      data: { isMain: false, type: "ANGLE" },
    });

    const updated = await prisma.productAsset.update({
      where: { id: context.params.id },
      data: {
        isMain: true,
        type: "MAIN",
      },
    });

    return ok(updated);
  } catch (error) {
    return handleRouteError(error);
  }
}
