import { describe, expect, it } from "bun:test";
import { defineModel, toDslConfig } from "./define";
import { t, required, primary, unique, label, listable } from "./types";

describe("defineModel", () => {
  const DeviceCategory = defineModel("iotbiz_device_category", {
    columns: {
      id: t.bigint(),
      code: t.string(64),
      name: t.string(128),
      status: t.enum(["enabled", "disabled"]),
      sort_order: t.integer(),
    },
    primaryKey: "id",
  });

  it("creates a model with correct tableName", () => {
    expect(DeviceCategory.tableName).toBe("iotbiz_device_category");
  });

  it("has correct column types", () => {
    expect(DeviceCategory.columns.code._sqlType).toBe("varchar");
    expect(DeviceCategory.columns.code.length).toBe(64);
  });

  it("infers primaryKey from columns", () => {
    expect(defineModel("t", { columns: { id: t.bigint(), name: t.string(128) } }).primaryKey).toBe("id");
  });

  it("toDslConfig produces columns array", () => {
    const c = toDslConfig(DeviceCategory);
    expect(c.name).toBe("iotbiz_device_category");
    expect((c.columns as Array<Record<string, unknown>>).length).toBe(5);
  });

  it("supports hooks", () => {
    const m = defineModel("t", {
      columns: { id: t.bigint() },
      hooks: { beforeCreate(d: { id?: bigint }) { return d; } },
    });
    expect(m.hooks?.beforeCreate).toBeDefined();
  });

  it("supports system invariants", () => {
    const m = defineModel("t", {
      columns: { id: t.bigint() },
      system: { tenantAware: true, immutableFields: ["id"] },
    });
    expect(m.system?.tenantAware).toBe(true);
    expect(m.system?.immutableFields).toContain("id");
  });

  it("supports default access for business roles", () => {
    const m = defineModel("t", {
      columns: { id: t.bigint() },
      access: { operator: ["select", "delete"], merchant: ["select"] },
    });
    expect(m.access?.operator).toContain("delete");
    expect(m.access?.merchant).not.toContain("delete");
  });

  it("toDslConfig emits table + system + access", () => {
    const m = defineModel("test", {
      columns: {
        id: t.bigint(),
        code: label("Code")(t.string(64)),
        name: label("Name")(listable(t.string(128))),
      },
      system: { tenantAware: true },
      access: { admin: ["select"] },
    });
    const c = toDslConfig(m);
    // Table UI: label() implies listable, so both columns appear
    const list = (c.table as Record<string, unknown>).list as Record<string, unknown>;
    const cols = list.columns as Array<Record<string, unknown>>;
    expect(cols.length).toBe(2);
    // System
    expect((c.system as Record<string, unknown>).tenantAware).toBe(true);
    // Access
    expect((c.access as Record<string, unknown>).admin).toEqual(["select"]);
  });
});

describe("t.* helpers", () => {
  it("t.string produces varchar", () => {
    expect(t.string(128)._sqlType).toBe("varchar");
  });

  it("chained constraints compose", () => {
    const c = required(primary(unique(t.string(64))));
    expect(c.required).toBe(true);
    expect(c.primary).toBe(true);
    expect(c.unique).toBe(true);
  });

  it("label sets label + listable", () => {
    const c = label("Name")(t.string(128));
    expect(c.label).toBe("Name");
    expect(c.listable).toBe(true);
  });

  it("listable marks column for table only", () => {
    const c = listable(t.string(128));
    expect(c.listable).toBe(true);
    expect(c.searchable).toBe(false);
  });
});
