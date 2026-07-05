import { generateTableJson as generateTableJsonHelper } from "../generate-helpers";
import type { TableMeta } from "../generate";

function toLabel(str: string): string {
  return str
    .split("_")
    .map((s, i) => (i === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s))
    .join(" ");
}

/** Generate model.js — schema definition with column metadata. */
export function generateModelJs(table: TableMeta): string {
  const columns = table.columns.map((c) => {
    const col: Record<string, unknown> = {
      name: c.name,
      type: c.type,
      label: toLabel(c.name),
    };
    if (c.length) col.length = c.length;
    if (c.precision !== undefined) col.precision = c.precision;
    if (c.scale !== undefined) col.scale = c.scale;
    if (!c.nullable && c.defaultValue === undefined) col.required = true;
    if (c.nullable) col.nullable = true;
    if (c.defaultValue !== undefined) col.default = c.defaultValue;
    if (c.isPrimary) col.primary = true;
    if (c.autoIncrement) col.autoIncrement = true;
    if (c.isUnique) col.unique = true;
    if (c.isIndex) col.index = true;
    if (c.comment) col.comment = c.comment;
    return col;
  });

  return `export default {
  name: "${table.name}",
  table: "${table.name}",
  primaryKey: "${table.columns.find((c) => c.isPrimary)?.name ?? "id"}",
  columns: ${JSON.stringify(columns, null, 2)},
  indexes: ${JSON.stringify(table.indexes.map((i) => ({ name: i.name, columns: i.columns, unique: i.unique })), null, 2)},
  option: { timestamps: true, softDeletes: false },
};
`;
}

/** Generate table.js — admin table configuration. */
export function generateTableJs(table: TableMeta): string {
  const cols = table.columns.map((c) => ({
    field: c.name,
    title: c.comment || toLabel(c.name),
    type: c.type === "enum" ? "select" : c.type.includes("int") ? "number" : c.type.includes("text") ? "text" : "text",
    width: c.isPrimary ? 80 : c.name.length > 20 ? 200 : 160,
  }));
  return `export default {
  title: "${toLabel(table.name)}",
  model: "${table.name}",
  list: {
    pageSize: 20,
    columns: ${JSON.stringify(cols, null, 2)},
  },
  form: {
    sections: [{
      title: "基本信息",
      fields: [${table.columns.filter((c) => !c.isPrimary && !["created_at", "updated_at"].includes(c.name)).map((c) => `"${c.name}"`).join(", ")}],
    }],
  },
};
`;
}

/** Generate acl.js — access control rules. */
export function generateAclJs(): string {
  return `export default {
  superadmin: { allow: ["select", "find", "add", "update", "delete"] },
  admin: { allow: ["select", "find", "add", "update", "delete"] },
  user: { allow: ["select", "find"] },
  guest: { allow: ["select", "find"] },
};
`;
}

/** Generate service.js — lifecycle hooks + custom API routes. */
export function generateServiceJs(): string {
  return `// Lifecycle hooks — auto-detected by framework
export async function beforeCreate(ctx, data) {
  data.created_at = new Date();
  return data;
}

export async function afterCreate(ctx, record) {
  return record;
}

export async function beforeUpdate(ctx, id, data) {
  data.updated_at = new Date();
  return data;
}

export async function beforeList(ctx, query) {
  return query;
}

// Add custom API routes as exports here.
// Any export NOT matching a lifecycle hook name is auto-registered as a route.
// Example:
//   export async function myCustomAction(ctx, input) {
//     const list = await ctx.think.model("${"table_name"}").where({}).select();
//     return { data: list };
//   }
`;
}
