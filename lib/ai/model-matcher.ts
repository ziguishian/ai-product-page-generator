import type { ModelDetectionResult } from "@/types/domain";

function findFirst(models: ModelDetectionResult[], predicate: (model: ModelDetectionResult) => boolean) {
  return models.find(predicate) ?? null;
}

function isStableAnalysisCandidate(modelId: string) {
  return !/(preview|experimental|beta|test|lite|flash-lite|image|imagen|recraft|flux|canvas)/i.test(modelId);
}

function isStableImageCandidate(modelId: string) {
  return !/(preview|experimental|beta|test)/i.test(modelId);
}

function hasRealImageGeneration(model: ModelDetectionResult) {
  return model.capabilities.image_gen && model.capabilities.real_image_gen !== false;
}

function hasRealImageEdit(model: ModelDetectionResult) {
  return model.capabilities.image_edit && model.capabilities.real_image_edit !== false;
}

export function recommendDefaultModels(models: ModelDetectionResult[]) {
  const stableVisionTextModels = models.filter(
    (item) => item.capabilities.text && item.capabilities.vision && isStableAnalysisCandidate(item.modelId),
  );
  const anyVisionTextModels = models.filter((item) => item.capabilities.text && item.capabilities.vision);
  const stableImageModels = models.filter(
    (item) => hasRealImageGeneration(item) && isStableImageCandidate(item.modelId),
  );
  const anyImageModels = models.filter((item) => hasRealImageGeneration(item));

  const analysisModel =
    findFirst(stableVisionTextModels, (item) => item.modelId.toLowerCase().includes("gemini")) ??
    findFirst(stableVisionTextModels, (item) => item.modelId.toLowerCase().includes("gpt-4o")) ??
    stableVisionTextModels[0] ??
    findFirst(anyVisionTextModels, (item) => item.modelId.toLowerCase().includes("gemini")) ??
    anyVisionTextModels[0] ??
    findFirst(models, (item) => item.capabilities.text);

  const planningModel =
    findFirst(
      models,
      (item) =>
        item.capabilities.text &&
        item.capabilities.structured_output &&
        item.modelId.toLowerCase().includes("gemini") &&
        !/(preview|experimental|beta|test)/i.test(item.modelId),
    ) ??
    findFirst(
      models,
      (item) =>
        item.capabilities.text &&
        item.capabilities.structured_output &&
        !/(preview|experimental|beta|test)/i.test(item.modelId),
    ) ??
    analysisModel;

  const heroImageModel =
    findFirst(
      stableImageModels,
      (item) => /(banana|nano-banana|nano banana|imagen|recraft|flux)/i.test(item.modelId),
    ) ??
    findFirst(stableImageModels, (item) => /gemini/i.test(item.modelId)) ??
    findFirst(stableImageModels, (item) => item.capabilities.high_quality) ??
    stableImageModels[0] ??
    findFirst(
      anyImageModels,
      (item) => /(banana|nano-banana|nano banana|imagen|recraft|flux)/i.test(item.modelId),
    ) ??
    findFirst(anyImageModels, (item) => /gemini/i.test(item.modelId)) ??
    anyImageModels[0] ??
    null;

  const detailImageModel =
    findFirst(
      stableImageModels,
      (item) => /(banana|imagen|flux|detail)/i.test(item.modelId),
    ) ??
    findFirst(stableImageModels, (item) => /gemini/i.test(item.modelId)) ??
    heroImageModel;

  const imageEditModel =
    findFirst(models, (item) => hasRealImageEdit(item) && isStableImageCandidate(item.modelId)) ??
    findFirst(models, (item) => hasRealImageEdit(item)) ??
    detailImageModel ??
    heroImageModel;

  return {
    analysisModelId: analysisModel?.modelId ?? null,
    planningModelId: planningModel?.modelId ?? null,
    heroImageModelId: heroImageModel?.modelId ?? null,
    detailImageModelId: detailImageModel?.modelId ?? null,
    imageEditModelId: imageEditModel?.modelId ?? null,
  };
}
