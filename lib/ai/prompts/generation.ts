import type { PageSection, ProductAsset } from "@prisma/client";

import {
  contentLanguageNamesForPrompt,
  normalizeContentLanguage,
  type ContentLanguage,
} from "@/lib/utils/content-language";

function buildReferenceText(referenceAssets: ProductAsset[]) {
  if (!referenceAssets.length) {
    return "No reference images were provided.";
  }

  return `Reference images: ${referenceAssets.map((item) => item.fileName).join(" / ")}`;
}

function buildMainImageInstruction(referenceAssets: ProductAsset[]) {
  if (!referenceAssets.length) {
    return "If no product image reference is provided, infer the product carefully from the structured analysis and keep the same product identity across all generated sections.";
  }

  return [
    "The uploaded main product image is the source of truth for product identity.",
    "Keep the same product shape, material, color family, proportions, and key recognisable details across every generated hero image and detail image.",
    "Do not invent a different product.",
    "Use the provided image as the visual anchor, then change composition, scene, angle, crop, lighting, and selling-point emphasis according to the section goal.",
  ].join(" ");
}

function buildAspectInstruction(aspectRatio: "1:1" | "3:4" | "9:16") {
  if (aspectRatio === "1:1") {
    return "The final image must be a square 1:1 e-commerce hero composition, optimized for tappable product gallery covers.";
  }

  return aspectRatio === "3:4"
    ? "The final image must be a vertical 3:4 marketplace poster composition."
    : "The final image must be a vertical 9:16 long-form mobile commerce composition.";
}

function buildTargetLanguageInstruction(contentLanguage: ContentLanguage) {
  const targetLanguage = contentLanguageNamesForPrompt[normalizeContentLanguage(contentLanguage)];

  return [
    `All user-facing marketing copy that appears inside the image must be written in ${targetLanguage}.`,
    `The section title, key selling points, short supporting copy, disclaimers, and CTA should all be in ${targetLanguage} when they appear in the image.`,
    "Do not mix in Simplified Chinese unless the target language is Simplified Chinese.",
    "Keep the typography native, polished, and commercially readable for the target language.",
  ].join(" ");
}

export function buildSectionImagePrompt(
  section: PageSection,
  referenceAssets: ProductAsset[] = [],
  aspectRatio: "1:1" | "3:4" | "9:16" = "9:16",
  contentLanguage: ContentLanguage = "zh-CN",
) {
  return [
    "You are a senior e-commerce key-visual designer creating marketplace-ready product artwork.",
    `Section type: ${section.type}`,
    `Section title: ${section.title}`,
    `Section goal: ${section.goal}`,
    `Section copy: ${section.copy}`,
    `Visual prompt guidance: ${section.visualPrompt}`,
    buildReferenceText(referenceAssets),
    buildMainImageInstruction(referenceAssets),
    buildAspectInstruction(aspectRatio),
    buildTargetLanguageInstruction(contentLanguage),
    "Generate one high-conversion mobile e-commerce visual for this section.",
    "The image should emphasize product clarity, composition hierarchy, material texture, and marketplace aesthetics.",
    "The headline, selling points, supporting copy, and CTA should be visually designed inside the image rather than left for later DOM text insertion.",
    "Make the result feel like finished commercial artwork, not a blank template.",
  ].join("\n");
}

export function buildRegenerationPrompt(
  section: PageSection,
  referenceAssets: ProductAsset[] = [],
  aspectRatio: "1:1" | "3:4" | "9:16" = "9:16",
  contentLanguage: ContentLanguage = "zh-CN",
) {
  return [
    buildSectionImagePrompt(section, referenceAssets, aspectRatio, contentLanguage),
    "This is a regeneration task. Keep the same product identity and selling-point direction, but improve composition accuracy, completion quality, and conversion appeal.",
  ].join("\n");
}

export function buildImageEditPrompt(
  section: PageSection,
  referenceAssets: ProductAsset[] = [],
  mode: "repaint" | "enhance" = "repaint",
  aspectRatio: "1:1" | "3:4" | "9:16" = "9:16",
  contentLanguage: ContentLanguage = "zh-CN",
) {
  const modeInstruction =
    mode === "enhance"
      ? "This is an enhancement task. Use the current image as the base, preserve the overall framing, and improve realism, texture, lighting, clarity, edge quality, and commercial polish."
      : "This is a repaint task. Use the current image as the base, keep the same product identity, and redesign the composition, atmosphere, styling, and conversion emphasis according to the section goal.";

  return [
    buildSectionImagePrompt(section, referenceAssets, aspectRatio, contentLanguage),
    modeInstruction,
    "The current section image must be treated as the editable base image.",
    "Keep the product identical to the uploaded main product image and do not replace it with a different item.",
    "Output one marketplace-ready mobile e-commerce image only.",
  ].join("\n");
}

export function buildSectionSvgLayoutPrompt(
  section: PageSection,
  referenceAssets: ProductAsset[] = [],
  aspectRatio: "1:1" | "3:4" | "9:16" = "9:16",
  contentLanguage: ContentLanguage = "zh-CN",
) {
  const targetLanguage = contentLanguageNamesForPrompt[normalizeContentLanguage(contentLanguage)];

  return [
    "You are designing a mobile e-commerce section poster that will be rendered as SVG.",
    "Return one strict JSON object only.",
    `All user-facing copy must be written in ${targetLanguage}.`,
    `Section type: ${section.type}`,
    `Section title: ${section.title}`,
    `Section goal: ${section.goal}`,
    `Section copy: ${section.copy}`,
    `Visual prompt guidance: ${section.visualPrompt}`,
    `Target aspect ratio: ${aspectRatio}`,
    buildReferenceText(referenceAssets),
    "Use the main uploaded product image as the product identity reference when composing the layout.",
    "Target JSON shape:",
    `{
  "headline": "string",
  "subheadline": "string",
  "badge": "string",
  "highlights": ["string", "string", "string"],
  "backgroundColor": "#F5E9D8",
  "accentColor": "#A85A2A",
  "panelColor": "#FFF8F0"
}`,
    "Keep the headline concise and commercial.",
    "highlights should contain 2 to 4 short selling points.",
  ].join("\n");
}
