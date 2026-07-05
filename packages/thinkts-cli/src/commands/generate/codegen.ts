import type { TableMeta } from "../generate";

function toLabel(str: string): string {
  return str
    .split("_")
    .map((s, i) => (i === 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s))
    .join(" ");
}

function dbTypeToTsType(col: TableMeta["columns"][number]): string {
  const t = col.dataType.toLowerCase();
  if (t.includes("int") || t === "bigint" || t === "tinyint" || t === "smallint") return "t.bigint()";
  if (t === "float" || t === "double" || t === "decimal") return "t.decimal()";
  if (t === "timestamp" || t === "datetime") return "t.timestamp()";
  if (t === "date") return "t.date()";
  if (t === "boolean" || t === "tinyint(1)") return "t.boolean()";
  if (t === "text" || t === "longtext" || t === "mediumtext") return "t.text()";
  return `t.varchar(${col.length ?? 255})`;
}

/** Generate model.ts — defineModel with columns, hooks, system, access. */
export function generateModelTs(table: TableMeta): string {
  const columns = table.columns.map((c) => {
    let line = `    ${c.name}: ${dbTypeToTsType(c)}`;
    if (c.isPrimary) line += ".primary()";
    if (c.autoIncrement) line += ".autoIncrement()";
    if (!c.nullable && c.defaultValue === undefined) line += ".required()";
    if (c.nullable) line += ".nullable()";
    if (c.isUnique) line += ".unique()";
    if (c.isIndex) line += ".index()";
    if (c.defaultValue !== undefined && c.defaultValue !== null) {
      line += `.default(${typeof c.defaultValue === "string" ? JSON.stringify(c.defaultValue) : c.defaultValue})`;
    }
    if (c.comment) line += `.comment(${JSON.stringify(c.comment)})`;
    return `${line},`;
  });

  const modelName = table.name;

  return `import { defineModel, t } from "thinkts";

/**
 * ${modelName} — ${table.comment ?? "auto-generated from database"}
 */
export default defineModel("${modelName}", {
  columns: {
${columns.join("\n")}
  },

  hooks: {
    // beforeCreate(data, ctx) {
    //   return data;
    // },
  },

  system: {
    // tenantAware: true,
    // softDelete: true,
  },

  access: {
    // admin: { create: true, read: true, update: true, delete: true },
    // user:  { create: false, read: true, update: false, delete: false },
  },
});
`;
}

/** Generate service.ts — business logic class. */
export function generateServiceTs(): string {
  return `import { BaseService } from "thinkts";

export class Service extends BaseService {
  // Business methods go here.
  // Use this.model(), this.create(), this.update() etc.
}
`;
}

// Kept for backward compatibility
export { generateModelTs as generateModelJs };
export function generateTableJs(table: TableMeta): string {
  return generateModelTs(table);
}
export function generateTableJson(table: TableMeta): string {
  return generateModelTs(table);
}
export function generateModelJson(table: TableMeta): string {
  return generateModelTs(table);
}
export function generateAclJson(): string {
  return `// ACL is now part of model.ts access field
export default {};`;
}
export function generateServiceJs(): string {
  return generateServiceTs();
}
export function generateTableTs(): string {
  return `// Table config is now auto-derived from model.ts columns
export default {};`;
}
