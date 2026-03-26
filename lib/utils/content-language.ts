export const contentLanguageOptions = ["zh-CN", "en-US", "ja-JP", "ko-KR"] as const;

export type ContentLanguage = (typeof contentLanguageOptions)[number];

export const contentLanguageLabels: Record<ContentLanguage, string> = {
  "zh-CN": "简体中文",
  "en-US": "English",
  "ja-JP": "日本語",
  "ko-KR": "한국어",
};

export const contentLanguageNamesForPrompt: Record<ContentLanguage, string> = {
  "zh-CN": "Simplified Chinese",
  "en-US": "English",
  "ja-JP": "Japanese",
  "ko-KR": "Korean",
};

export function normalizeContentLanguage(value: unknown): ContentLanguage {
  if (typeof value === "string" && (contentLanguageOptions as readonly string[]).includes(value)) {
    return value as ContentLanguage;
  }

  return "zh-CN";
}
