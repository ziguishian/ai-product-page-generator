export interface Base64UploadPayload {
  fileName: string;
  mimeType: string;
  base64Data: string;
}

export function stripDataUrlPrefix(value: string) {
  const match = value.match(/^data:.+;base64,(.+)$/);
  return match?.[1] ?? value;
}

export async function fileToBase64Payload(file: File): Promise<Base64UploadPayload> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });

  return {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    base64Data: stripDataUrlPrefix(dataUrl),
  };
}
