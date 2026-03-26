import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { saveUploadAsset } from "@/lib/storage/asset-manager";
import { handleRouteError, ok } from "@/lib/utils/route";

const uploadAssetSchema = z.object({
  type: z.enum(["MAIN", "ANGLE", "DETAIL", "REFERENCE"]),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  base64Data: z.string().min(1),
});

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const input = uploadAssetSchema.parse(await request.json());
    const existingCount = await prisma.productAsset.count({
      where: { projectId: context.params.id },
    });

    const asset = await saveUploadAsset({
      projectId: context.params.id,
      type: input.type,
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileBuffer: Buffer.from(input.base64Data, "base64"),
      sortOrder: existingCount,
      isMain: input.type === "MAIN",
    });

    return ok(asset, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
