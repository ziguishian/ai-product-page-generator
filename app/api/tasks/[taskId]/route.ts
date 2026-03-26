import { prisma } from "@/lib/db/prisma";
import { handleRouteError, ok } from "@/lib/utils/route";

export async function GET(_request: Request, context: { params: { taskId: string } }) {
  try {
    const task = await prisma.generationTask.findUnique({
      where: { id: context.params.taskId },
    });
    return ok(task);
  } catch (error) {
    return handleRouteError(error);
  }
}
