import type { SectionTypeKey } from "@/types/domain";

export function prismaSectionTypeToKey(input: string): SectionTypeKey {
  return input.toLowerCase() as SectionTypeKey;
}
