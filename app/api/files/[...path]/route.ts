import { readStorageFile } from "@/lib/storage/asset-manager";
import { handleRouteError } from "@/lib/utils/route";

function getContentType(pathname: string) {
  const normalized = pathname.toLowerCase();
  if (normalized.endsWith(".png")) return "image/png";
  if (normalized.endsWith(".jpg") || normalized.endsWith(".jpeg")) return "image/jpeg";
  if (normalized.endsWith(".webp")) return "image/webp";
  if (normalized.endsWith(".gif")) return "image/gif";
  if (normalized.endsWith(".svg")) return "image/svg+xml; charset=utf-8";
  if (normalized.endsWith(".json")) return "application/json; charset=utf-8";
  if (normalized.endsWith(".zip")) return "application/zip";
  return "application/octet-stream";
}

export async function GET(
  _request: Request,
  context: { params: { path: string[] } },
) {
  try {
    const relativePath = context.params.path.join("/");
    const buffer = await readStorageFile(relativePath);
    const contentType = getContentType(relativePath);

    return new Response(buffer, {
      headers: {
        "Content-Type": String(contentType),
      },
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
