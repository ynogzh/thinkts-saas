// Barrel — re-exports from data files. Import from this file everywhere.
export { RESOURCES, _source } from "./resource-data";
export { saasModules } from "./module-data";
export { primaryWorkflows } from "./workflow-data";
export { getResourceByPath, getResourcesByModule } from "./catalog-helpers";
