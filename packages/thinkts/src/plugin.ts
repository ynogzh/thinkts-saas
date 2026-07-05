import type { LoadedData } from "./loader";
import type { BeforeActionHook, AfterActionHook, RequestHook, ErrorHook } from "./kernel";
import type { DslAppData } from "./model/registry";
import { existsSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";
import { loadAllFeatures } from "./loader";
import { loadDslAppData } from "./model/loader";

/* ── Plugin interface ── */

export interface Plugin {
  name: string;
  depends?: string[];
  load(ctx: PluginLoadContext): Promise<void>;
}

/* ── Plugin load context ── */

export interface PluginLoadContext {
  /** Plugin's package root (packages/<name>/) */
  rootPath: string;
  /** Register a model class or DSL */
  model(name: string, def: unknown): void;
  /** Register a service class */
  service(name: string, svc: unknown): void;
  /** Register a controller class */
  controller(name: string, ctrl: unknown): void;
  /** Register a logic class */
  logic(name: string, lgc: unknown): void;
  /** Scan plugin's models/ directory for model.js/json */
  scanModels(dir: string): void;
  /** Scan plugin's services/ directory */
  scanServices(dir: string): void;
  /** Scan plugin's controllers/ directory */
  scanControllers(dir: string): void;
  /** Scan plugin's logics/ directory */
  scanLogics(dir: string): void;
  /** Scan DSL directory (model/service/table/acl) */
  scanDsl(dir: string): void;
  /** Register a kernel hook */
  onRequest(hook: RequestHook, priority?: number): void;
  beforeAction(hook: BeforeActionHook, priority?: number): void;
  afterAction(hook: AfterActionHook, priority?: number): void;
  onError(hook: ErrorHook, priority?: number): void;
}

/* ── Internal context implementation ── */

interface HookEntry<T> {
  hook: T;
  priority: number;
}

class LoadContext implements PluginLoadContext {
  rootPath: string;
  models: Record<string, unknown> = {};
  services: Record<string, unknown> = {};
  controllers: Record<string, unknown> = {};
  logics: Record<string, unknown> = {};
  dslData: DslAppData = {
    models: {},
    services: {},
    apis: {},
    tables: {},
    acls: {},
    dataResources: {},
  };
  requestHooks: HookEntry<RequestHook>[] = [];
  beforeActionHooks: HookEntry<BeforeActionHook>[] = [];
  afterActionHooks: HookEntry<AfterActionHook>[] = [];
  errorHooks: HookEntry<ErrorHook>[] = [];

  constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  model(name: string, def: unknown): void {
    this.models[name] = def;
  }

  service(name: string, svc: unknown): void {
    this.services[name] = svc;
  }

  controller(name: string, ctrl: unknown): void {
    this.controllers[name] = ctrl;
  }

  logic(name: string, lgc: unknown): void {
    this.logics[name] = lgc;
  }

  scanModels(dir: string): void {
    const abs = this.absDir(dir);
    if (!abs) return;
    const features = loadAllFeatures(abs);
    Object.assign(this.models, features.models);
    this.mergeDsl(loadDslAppData(abs));
  }

  scanServices(dir: string): void {
    const abs = this.absDir(dir);
    if (!abs) return;
    const features = loadAllFeatures(abs);
    Object.assign(this.services, features.services);
    this.mergeDsl(loadDslAppData(abs));
  }

  scanControllers(dir: string): void {
    const abs = this.absDir(dir);
    if (!abs) return;
    const features = loadAllFeatures(abs);
    Object.assign(this.controllers, features.controllers);
  }

  scanLogics(dir: string): void {
    const abs = this.absDir(dir);
    if (!abs) return;
    const features = loadAllFeatures(abs);
    Object.assign(this.logics, features.logics);
  }

  scanDsl(dir: string): void {
    const abs = this.absDir(dir);
    if (!abs) return;
    this.mergeDsl(loadDslAppData(abs));
  }

  onRequest(hook: RequestHook, priority = 0): void {
    this.requestHooks.push({ hook, priority });
  }

  beforeAction(hook: BeforeActionHook, priority = 0): void {
    this.beforeActionHooks.push({ hook, priority });
  }

  afterAction(hook: AfterActionHook, priority = 0): void {
    this.afterActionHooks.push({ hook, priority });
  }

  onError(hook: ErrorHook, priority = 0): void {
    this.errorHooks.push({ hook, priority });
  }

  private mergeDsl(dsl: DslAppData): void {
    const d = this.dslData;
    Object.assign(d.models, dsl.models);
    Object.assign(d.services, dsl.services);
    Object.assign(d.apis, dsl.apis);
    Object.assign(d.tables, dsl.tables);
    Object.assign(d.acls, dsl.acls);
    Object.assign(d.dataResources, dsl.dataResources);
  }

  private absDir(dir: string): string | null {
    const abs = resolve(this.rootPath, dir);
    return existsSync(abs) ? abs : null;
  }

  toLoadedData(): LoadedData {
    return {
      controllers: this.controllers,
      logics: this.logics,
      services: this.services,
      models: this.models,
      dsl: this.dslData,
    };
  }
}

/* ── Plugin loader ── */

interface PluginEntry {
  plugin: Plugin;
  path: string;
  name: string;
}

interface LoadedPlugin {
  entry: PluginEntry;
  ctx: LoadContext;
}

export class PluginLoader {
  private packagesDir: string;

  constructor(packagesDir: string) {
    this.packagesDir = packagesDir;
  }

  /**
   * Scan packagesDir for plugins, topo-sort by depends, call load() in order.
   * Returns merged LoadedData ready for Application.
   */
  async load(): Promise<LoadedData> {
    const entries = this.discoverPlugins();
    if (entries.length === 0) {
      return { controllers: {}, logics: {}, services: {}, models: {} };
    }

    const sorted = this.topologicalSort(entries);
    const loaded: LoadedPlugin[] = [];

    for (const entry of sorted) {
      const ctx = new LoadContext(entry.path);
      await entry.plugin.load(ctx);
      loaded.push({ entry, ctx });
    }

    return this.mergeLoadedData(loaded);
  }

  private discoverPlugins(): PluginEntry[] {
    const result: PluginEntry[] = [];
    if (!existsSync(this.packagesDir)) return result;

    const names = readdirSync(this.packagesDir);
    for (const name of names) {
      if (name === "thinkts" || name === "thinkts-cli") continue; // skip infra

      const pkgDir = join(this.packagesDir, name);
      if (!statSync(pkgDir).isDirectory()) continue;

      for (const ext of ["ts", "js"]) {
        const pluginPath = join(pkgDir, `plugin.${ext}`);
        if (!existsSync(pluginPath)) continue;

        try {
          const mod = require(pluginPath);
          const plugin = (mod.default ?? mod) as Plugin;
          if (plugin && typeof plugin.load === "function") {
            result.push({ plugin, path: pkgDir, name: plugin.name ?? name });
          }
        } catch (err) {
          console.warn(`[plugin] failed to load ${pluginPath}:`, err);
        }
        break; // only try first ext found
      }
    }
    return result;
  }

  private topologicalSort(entries: PluginEntry[]): PluginEntry[] {
    const byName = new Map<string, PluginEntry>();
    for (const e of entries) byName.set(e.name, e);

    const visited = new Set<string>();
    const sorted: PluginEntry[] = [];

    const visit = (name: string, path: string[]): void => {
      if (visited.has(name)) return;
      if (path.includes(name)) {
        throw new Error(`[plugin] circular dependency: ${path.join(" → ")} → ${name}`);
      }
      const entry = byName.get(name);
      if (!entry) return; // dep not in packagesDir — skip
      const deps = entry.plugin.depends ?? [];
      for (const dep of deps) visit(dep, [...path, name]);
      visited.add(name);
      sorted.push(entry);
    };

    for (const e of entries) {
      if (!visited.has(e.name)) visit(e.name, []);
    }
    return sorted;
  }

  private mergeLoadedData(loaded: LoadedPlugin[]): LoadedData {
    const result: LoadedData = {
      controllers: {},
      logics: {},
      services: {},
      models: {},
    };
    for (const el of loaded) {
      const data = el.ctx.toLoadedData();
      Object.assign(result.controllers, data.controllers);
      Object.assign(result.logics, data.logics);
      Object.assign(result.services, data.services);
      Object.assign(result.models, data.models);
      if (data.dsl) {
        result.dsl ??= data.dsl;
        const d = result.dsl!;
        if (data.dsl.models) Object.assign(d.models, data.dsl.models);
        if (data.dsl.services) Object.assign(d.services, data.dsl.services);
        if (data.dsl.tables) Object.assign(d.tables, data.dsl.tables);
        if (data.dsl.acls) Object.assign(d.acls, data.dsl.acls);
        if (data.dsl.apis) Object.assign(d.apis, data.dsl.apis);
        if (data.dsl.dataResources) Object.assign(d.dataResources, data.dsl.dataResources);
      }
    }
    return result;
  }

  /** Register hooks from all loaded plugins onto the kernel */
  wireHooks(loaded: LoadedPlugin[], kernel: { onRequest: (h: RequestHook, p: number, s?: string) => void; beforeAction: (h: BeforeActionHook, p: number, s?: string) => void; afterAction: (h: AfterActionHook, p: number, s?: string) => void; onError: (h: ErrorHook, p: number, s?: string) => void }): void {
    for (const el of loaded) {
      const name = el.entry.name;
      for (const h of el.ctx.requestHooks) kernel.onRequest(h.hook, h.priority, name);
      for (const h of el.ctx.beforeActionHooks) kernel.beforeAction(h.hook, h.priority, name);
      for (const h of el.ctx.afterActionHooks) kernel.afterAction(h.hook, h.priority, name);
      for (const h of el.ctx.errorHooks) kernel.onError(h.hook, h.priority, name);
    }
  }
}
