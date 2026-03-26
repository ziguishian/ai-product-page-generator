import { buildImageArchive } from "@/lib/services/export-service";
import { handleRouteError } from "@/lib/utils/route";

export async function GET(_request: Request, context: { params: { id: string } }) {
  try {
    const stream = await buildImageArchive(context.params.id);
    return new Response(stream as never, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${context.params.id}-detail-page-images.zip"`,
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
