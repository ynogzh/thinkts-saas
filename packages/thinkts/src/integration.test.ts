import { describe, it, expect } from "bun:test";
import { PluginLoader } from "./plugin";
import { resolve } from "path";

describe("thinkts-saas integration", () => {
  // packagesDir is ../../packages relative to packages/thinkts/
  // i.e. the monorepo root's packages/ dir
  const packagesDir = resolve(import.meta.dir, "../../");

  it("discovers all 8 plugins", async () => {
    const loader = new PluginLoader(packagesDir);
    const data = await loader.load();

    const dslModels = Object.keys(data.dsl?.models ?? {});
    expect(dslModels.length).toBeGreaterThan(0);
  });

  it("loads tenant plugin with correct DSL", async () => {
    const loader = new PluginLoader(packagesDir);
    const data = await loader.load();

    const dslModels = Object.keys(data.dsl?.models ?? {});
    expect(dslModels).toContain("platform_tenant");
    expect(dslModels).toContain("platform_tenant_module");
  });

  it("loads all 8 plugins with their models", async () => {
    const loader = new PluginLoader(packagesDir);
    const data = await loader.load();

    const dslModels = Object.keys(data.dsl?.models ?? {});
    expect(dslModels).toContain("platform_tenant");       // tenant
    expect(dslModels).toContain("identity_user");         // identity
    expect(dslModels).toContain("permission_role");       // permission
    expect(dslModels).toContain("permission_permission");
    expect(dslModels).toContain("permission_menu");
    expect(dslModels).toContain("trade_order");           // trade
    expect(dslModels).toContain("payment_channel");       // payment
    expect(dslModels).toContain("promote_agent");         // promote
    expect(dslModels).toContain("content_category");      // cms
    expect(dslModels).toContain("content_article");
  });

  it("promote loads all 8 sub-models", async () => {
    const loader = new PluginLoader(packagesDir);
    const data = await loader.load();

    const dslModels = Object.keys(data.dsl?.models ?? {});
    expect(dslModels).toContain("promote_agent");
    expect(dslModels).toContain("promote_agent_level");
    expect(dslModels).toContain("promote_agent_relation");
    expect(dslModels).toContain("promote_commission_rule");
    expect(dslModels).toContain("promote_commission_record");
    expect(dslModels).toContain("promote_coupon_template");
    expect(dslModels).toContain("promote_coupon_scope");
    expect(dslModels).toContain("promote_user_coupon");
    expect(dslModels).toContain("promote_coupon_use_record");
  });

  it("total DSL model count is exactly 30", async () => {
    const loader = new PluginLoader(packagesDir);
    const data = await loader.load();

    const dslModels = Object.keys(data.dsl?.models ?? {});
    // tenant(2) + identity(3) + permission(7) + trade(3) + payment(4) + promote(9) + cms(2) = 30
    expect(dslModels.length).toBe(30);
  });
});
