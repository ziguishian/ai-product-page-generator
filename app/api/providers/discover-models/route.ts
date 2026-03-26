import { NextRequest } from "next/server";

import { discoverProviderModels, resolveProviderConnectionInput } from "@/lib/services/provider-service";
import { providerInputSchema } from "@/lib/validations/provider";
import { handleRouteError, ok } from "@/lib/utils/route";

export async function POST(request: NextRequest) {
  try {
    const parsed = providerInputSchema.parse(await request.json());
    const input = await resolveProviderConnectionInput(parsed);
    const result = await discoverProviderModels(input);
    return ok(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
