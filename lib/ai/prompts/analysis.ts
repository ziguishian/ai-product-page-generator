import type { ProductAsset } from "@prisma/client";

const requiredJsonShape = `{
  "productName": "string",
  "category": "string",
  "subcategory": "string",
  "material": "string",
  "color": "string",
  "styleTags": ["string"],
  "targetAudience": ["string"],
  "usageScenarios": ["string"],
  "coreSellingPoints": ["string"],
  "differentiationPoints": ["string"],
  "userConcerns": ["string"],
  "recommendedFocusPoints": ["string"],
  "suggestedSectionPlan": [
    {
      "type": "hero | selling_points | scenario | detail_closeup | specs | material | comparison | gift_scene | brand_trust | summary",
      "title": "string",
      "goal": "string"
    }
  ]
}`;

const supportedSectionTypes = [
  "hero",
  "selling_points",
  "scenario",
  "detail_closeup",
  "specs",
  "material",
  "comparison",
  "gift_scene",
  "brand_trust",
  "summary",
].join(", ");

export function buildProductAnalysisPrompt(assets: ProductAsset[]) {
  const assetSummary = assets
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(
      (asset, index) =>
        `${index + 1}. type=${asset.type}; file=${asset.fileName}; isMain=${asset.isMain ? "yes" : "no"}`,
    )
    .join("\n");

  return [
    "You are a senior e-commerce product strategist and detail-page planner.",
    "Analyze the provided product images and asset hints, then return one strict JSON object only.",
    "Do not output markdown, code fences, explanations, comments, or extra keys.",
    "All copy values should be written in Simplified Chinese.",
    "If some attributes are uncertain, infer the most likely answer from the images and keep the field non-empty.",
    "",
    "Available assets:",
    assetSummary || "No uploaded assets.",
    "",
    "Required rules:",
    "1. Every required key must exist.",
    "2. Every array field must be an array of short Chinese strings.",
    "3. suggestedSectionPlan must contain at least 6 sections.",
    `4. suggestedSectionPlan.type must be one of: ${supportedSectionTypes}.`,
    "5. Focus on e-commerce conversion, visual hierarchy, and section planning.",
    "",
    "Return exactly this JSON shape:",
    requiredJsonShape,
  ].join("\n");
}

export function buildProductAnalysisRepairPrompt(raw: string) {
  return [
    "You repair malformed product-analysis output into one strict JSON object.",
    "Return JSON only. No markdown, no explanations, no extra keys.",
    "All string values should be in Simplified Chinese when possible.",
    "If a field is missing, infer a reasonable non-empty value from the source content.",
    "If suggestedSectionPlan is missing or too short, create at least 6 valid sections.",
    `Valid section types: ${supportedSectionTypes}.`,
    "",
    "Target JSON shape:",
    requiredJsonShape,
    "",
    "Source content to repair:",
    raw,
  ].join("\n");
}
