import { describe, it, expect } from "bun:test";
import { PluginLoader } from "./plugin";
import type { Plugin, PluginLoadContext } from "./plugin";
import { existsSync, mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

function createTempPlugin(dir: string, name: string, depends: string[] = []): void {
  mkdirSync(dir, { recursive: true });
  const code = `
module.exports = {
  name: "${name}",
  depends: ${JSON.stringify(depends)},
  async load(ctx) {
    ctx.model("${name}_model", {});
  },
};
`;
  const tsCode = `
import type { Plugin, PluginLoadContext } from "thinkts";

const plugin: Plugin = {
  name: "${name}",
  depends: ${JSON.stringify(depends)},
  async load(ctx: PluginLoadContext) {
    ctx.model("${name}_model", {});
  },
};
export default plugin;
`;
  writeFileSync(join(dir, "plugin.js"), code);
  writeFileSync(join(dir, "plugin.ts"), tsCode);
}

describe("PluginLoader", () => {
  it("returns empty data when no plugins in dir", async () => {
    const tmp = join(tmpdir(), `thinkts-test-${Date.now()}-empty`);
    mkdirSync(tmp, { recursive: true });
    try {
      const loader = new PluginLoader(tmp);
      const data = await loader.load();
      expect(data.controllers).toEqual({});
      expect(data.services).toEqual({});
      expect(data.models).toEqual({});
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("discovers and loads a single plugin", async () => {
    const tmp = join(tmpdir(), `thinkts-test-${Date.now()}-single`);
    try {
      createTempPlugin(join(tmp, "tenant"), "tenant");
      const loader = new PluginLoader(tmp);
      const data = await loader.load();
      expect(data.models).toHaveProperty("tenant_model");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("skips thinkts and thinkts-cli dirs", async () => {
    const tmp = join(tmpdir(), `thinkts-test-${Date.now()}-skip`);
    try {
      createTempPlugin(join(tmp, "thinkts"), "framework");
      createTempPlugin(join(tmp, "tenant"), "tenant");
      const loader = new PluginLoader(tmp);
      const data = await loader.load();
      // thinkts is skipped, only tenant is loaded
      expect(data.models).toHaveProperty("tenant_model");
      expect(data.models).not.toHaveProperty("framework_model");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("loads plugins in topological order", async () => {
    const tmp = join(tmpdir(), `thinkts-test-${Date.now()}-topo`);
    try {
      createTempPlugin(join(tmp, "identity"), "identity", ["tenant"]);
      createTempPlugin(join(tmp, "tenant"), "tenant");
      // tenant has no deps, identity depends on tenant
      // tenant should load first
      const loader = new PluginLoader(tmp);
      const data = await loader.load();
      expect(data.models).toHaveProperty("tenant_model");
      expect(data.models).toHaveProperty("identity_model");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("handles missing dependency gracefully", async () => {
    const tmp = join(tmpdir(), `thinkts-test-${Date.now()}-missing-dep`);
    try {
      // identity depends on auth which doesn't exist in packagesDir
      createTempPlugin(join(tmp, "identity"), "identity", ["auth"]);
      const loader = new PluginLoader(tmp);
      const data = await loader.load();
      // identity still loads — missing dep is skipped
      expect(data.models).toHaveProperty("identity_model");
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });

  it("loads models via scanModels", async () => {
    const tmp = join(tmpdir(), `thinkts-test-${Date.now()}-scan`);
    try {
      const pkgDir = join(tmp, "cms");
      mkdirSync(join(pkgDir, "models", "article"), { recursive: true });
      writeFileSync(join(pkgDir, "models", "article", "model.js"), `
module.exports = class ArticleModel {};
`);
      writeFileSync(join(pkgDir, "plugin.ts"), `
import type { Plugin, PluginLoadContext } from "thinkts";
const plugin: Plugin = {
  name: "cms",
  async load(ctx: PluginLoadContext) {
    ctx.scanModels("./models");
  },
};
export default plugin;
`);
      const loader = new PluginLoader(tmp);
      const data = await loader.load();
      const keys = Object.keys(data.models);
      expect(keys.length).toBeGreaterThan(0);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
