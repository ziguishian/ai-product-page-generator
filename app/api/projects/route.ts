import { NextRequest } from "next/server";

import { createProject, listProjects } from "@/lib/services/project-service";
import { projectCreateSchema } from "@/lib/validations/project";
import { handleRouteError, ok } from "@/lib/utils/route";

export async function GET() {
  try {
    const projects = await listProjects();
    return ok(projects);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const input = projectCreateSchema.parse(await request.json());
    const project = await createProject(input);
    return ok(project, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
