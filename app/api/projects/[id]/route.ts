import { NextRequest } from "next/server";

import { deleteProject, getProjectDetail, updateProject } from "@/lib/services/project-service";
import { projectUpdateSchema } from "@/lib/validations/project";
import { fail, handleRouteError, ok } from "@/lib/utils/route";

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const project = await getProjectDetail(context.params.id);
    if (!project) {
      return fail("NOT_FOUND", "Project not found.", null, 404);
    }
    return ok(project);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
  try {
    const input = projectUpdateSchema.parse(await request.json());
    const project = await updateProject(context.params.id, input);
    return ok(project);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: NextRequest, context: { params: { id: string } }) {
  try {
    const project = await deleteProject(context.params.id);
    if (!project) {
      return fail("NOT_FOUND", "Project not found.", null, 404);
    }
    return ok(project);
  } catch (error) {
    return handleRouteError(error);
  }
}
