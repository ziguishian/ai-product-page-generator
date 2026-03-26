import path from "path";

export function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function extFromMime(mimeType?: string | null) {
  if (!mimeType) {
    return "bin";
  }

  const normalized = mimeType.toLowerCase();
  if (normalized.includes("png")) return "png";
  if (normalized.includes("jpeg") || normalized.includes("jpg")) return "jpg";
  if (normalized.includes("webp")) return "webp";
  if (normalized.includes("gif")) return "gif";
  if (normalized.includes("svg")) return "svg";
  return "bin";
}

export function relativeStorageUrl(filePath: string) {
  const normalized = filePath.split(path.sep).join("/");
  return `/api/files/${normalized}`;
}
