import type { ProductAnalysisOutput } from "@/lib/ai/schemas/product-analysis";
import {
  platformLabels,
  sectionTypeLabels,
  styleLabels,
  type PlatformOption,
  type StyleOption,
} from "@/types/domain";
import { contentLanguageNamesForPrompt, normalizeContentLanguage, type ContentLanguage } from "@/lib/utils/content-language";

const sectionTypeGuide = Object.entries(sectionTypeLabels)
  .map(([key, label]) => `${key}=${label}`)
  .join(", ");

export function buildSectionPlanningPrompt(
  analysis: ProductAnalysisOutput,
  style: string,
  platform: string,
  detailSectionCount = 6,
  heroImageCount = 4,
  contentLanguage: ContentLanguage = "zh-CN",
) {
  const styleLabel = styleLabels[style as StyleOption] ?? style;
  const platformLabel = platformLabels[platform as PlatformOption] ?? platform;
  const targetLanguage = contentLanguageNamesForPrompt[normalizeContentLanguage(contentLanguage)];

  const planningContext = {
    productName: analysis.productName,
    category: analysis.category,
    subcategory: analysis.subcategory,
    material: analysis.material,
    color: analysis.color,
    styleTags: analysis.styleTags.slice(0, 8),
    targetAudience: analysis.targetAudience.slice(0, 6),
    usageScenarios: analysis.usageScenarios.slice(0, 6),
    coreSellingPoints: analysis.coreSellingPoints.slice(0, 8),
    differentiationPoints: analysis.differentiationPoints.slice(0, 6),
    userConcerns: analysis.userConcerns.slice(0, 6),
    recommendedFocusPoints: analysis.recommendedFocusPoints.slice(0, 8),
    suggestedSectionPlan: analysis.suggestedSectionPlan.slice(0, 8),
  };

  return [
    "You are a senior e-commerce content strategist and mobile detail-page planner.",
    `Platform: ${platformLabel}`,
    `Style: ${styleLabel}`,
    `Target content language: ${targetLanguage}`,
    "Create a mobile product-detail section plan based on the planning context below.",
    "Return strict JSON only.",
    `The output must contain exactly ${heroImageCount + detailSectionCount} sections in total.`,
    `You must create exactly ${heroImageCount} hero sections and exactly ${detailSectionCount} non-hero detail sections.`,
    "All hero sections must come first in the output array.",
    `Hero sections represent individual square hero gallery images, so each hero section must have a distinct first-screen communication role across these ${heroImageCount} angles.`,
    "The hero sections should cover different roles such as primary visual, core selling point, scenario mood, trust, and differentiation without repeating the same purpose.",
    "All non-hero sections must come after the hero sections.",
    "Each section item must include: id, type, title, goal, copy, visualPrompt, editableFields.",
    `All user-facing section titles, goals, copy, and in-image text instructions must be written in ${targetLanguage}.`,
    "visualPrompt must use this exact two-part format:",
    `Primary Prompt: <visual direction in ${targetLanguage}>`,
    "English Prompt: <English image prompt>",
    "The visualPrompt must explicitly require the image model to generate the marketing title, selling points, supporting copy, and CTA directly inside the image, instead of relying on external DOM text.",
    `Allowed section types: ${sectionTypeGuide}`,
    "editableFields should include at least one of: sellingPoints, tone, compositionHint.",
    "Avoid duplicate section goals and avoid repeating the same section type excessively.",
    "The section flow should feel commercially complete and conversion-oriented.",
    "",
    "Planning context:",
    JSON.stringify(planningContext, null, 2),
  ].join("\n");
}
