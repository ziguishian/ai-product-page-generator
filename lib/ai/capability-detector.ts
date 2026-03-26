import type { CapabilityMap, ModelDetectionResult, ModelRoleMap } from "@/types/domain";

const emptyCapabilityMap = (): CapabilityMap => ({
  text: false,
  vision: false,
  image_gen: false,
  image_edit: false,
  structured_output: false,
  fast: false,
  cheap: false,
  high_quality: false,
});

const emptyRoleMap = (): ModelRoleMap => ({
  analysis: false,
  planning: false,
  hero_image: false,
  detail_image: false,
  image_edit: false,
});

export function detectModelCapabilities(modelId: string): CapabilityMap {
  const id = modelId.toLowerCase();
  const map = emptyCapabilityMap();

  if (/(gpt|gemini|claude|qwen|glm|deepseek|chat|instruct|command|llama|mistral)/.test(id)) {
    map.text = true;
    map.structured_output = true;
  }

  if (/(vision|vl|4o|omni|gemini|multimodal|qwen-vl)/.test(id)) {
    map.vision = true;
    map.text = true;
    map.structured_output = true;
  }

  if (/(image|imagen|flux|sdxl|stable-diffusion|banana|nano-banana|recraft)/.test(id)) {
    map.image_gen = true;
    map.high_quality = true;
  }

  if (/(edit|inpaint|mask)/.test(id)) {
    map.image_edit = true;
  }

  if (/(flash|mini|nano|lite|turbo|instant)/.test(id)) {
    map.fast = true;
    map.cheap = true;
  }

  if (/(pro|ultra|4\\.1|opus|quality|max)/.test(id)) {
    map.high_quality = true;
  }

  if (!Object.values(map).some(Boolean)) {
    map.text = true;
  }

  return map;
}

export function detectModelRoles(capabilities: CapabilityMap): ModelRoleMap {
  const roles = emptyRoleMap();

  if (capabilities.text) {
    roles.analysis = true;
    roles.planning = true;
  }

  if (capabilities.image_gen) {
    roles.hero_image = true;
    roles.detail_image = true;
  }

  if (capabilities.image_edit) {
    roles.image_edit = true;
  }

  return roles;
}

export function normalizeDetectedModels(
  models: Array<{ id: string; label?: string }>,
): ModelDetectionResult[] {
  return models.map((model) => {
    const capabilities = detectModelCapabilities(model.id);
    return {
      modelId: model.id,
      label: model.label ?? model.id,
      capabilities,
      roles: detectModelRoles(capabilities),
      quality: capabilities.high_quality ? "high" : capabilities.fast ? "balanced" : "standard",
      latency: capabilities.fast ? "fast" : "standard",
      cost: capabilities.cheap ? "low" : capabilities.high_quality ? "high" : "medium",
      isAvailable: true,
    };
  });
}
