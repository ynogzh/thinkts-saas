import type { ResourcePageConfig } from "./types";
import { RESOURCES } from "./resource-data";

export function getResourceByPath(path: string): ResourcePageConfig | undefined {
  return RESOURCES.find((r) => r.path === path);
}

export function getResourcesByModule(moduleCode: string): ResourcePageConfig[] {
  return RESOURCES.filter((r) => r.moduleCode === moduleCode);
}
