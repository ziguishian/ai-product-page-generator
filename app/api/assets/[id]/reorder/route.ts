import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { handleRouteError, ok } from "@/lib/utils/route";

const reorderSchema = z.object({
  sortOrder: z.number().int().min(0),
});

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    const input = reorderSchema.parse(await request.json());
    const asset = await prisma.productAsset.update({
      where: { id: context.params.id },
      data: { sortOrder: input.sortOrder },
    });
    return ok(asset);
  } catch (error) {
    return handleRouteError(error);
  }
}
