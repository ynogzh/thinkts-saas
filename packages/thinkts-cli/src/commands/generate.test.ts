import { describe, it, expect } from "bun:test";
import { tableNameToDslPath, validateDslPath } from "./generate";

describe("tableNameToDslPath", () => {
  it("splits full table name into nested path", () => {
    expect(tableNameToDslPath("iotbiz_device_type")).toBe("iotbiz/device/type");
    expect(tableNameToDslPath("iotbiz_param_template")).toBe("iotbiz/param/template");
    expect(tableNameToDslPath("iotbiz_merchant")).toBe("iotbiz/merchant");
    expect(tableNameToDslPath("permission_user_role")).toBe("permission/user/role");
    expect(tableNameToDslPath("platform_tenant")).toBe("platform/tenant");
  });

  it("falls back to home for single segment", () => {
    expect(tableNameToDslPath("logs")).toBe("home/logs");
  });
});

describe("validateDslPath", () => {
  it("accepts valid nested paths", () => {
    expect(() => validateDslPath("iotbiz/device/type")).not.toThrow();
    expect(() => validateDslPath("iotbiz/param/template")).not.toThrow();
  });

  it("rejects paths with hyphens", () => {
    expect(() => validateDslPath("iotbiz/device-type")).toThrow(/hyphen/);
  });

  it("rejects pre-composed namespace directories", () => {
    expect(() => validateDslPath("iotbiz_device/type")).toThrow(/pre-composed/);
    expect(() => validateDslPath("operation_campaign/campaign")).toThrow(/pre-composed/);
  });
});
