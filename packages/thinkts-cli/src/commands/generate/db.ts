import { SQL } from "bun";
import { Database } from "bun:sqlite";

export interface DbConfig {
  adapter: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  path?: string;
  url?: string;
}

export interface ColumnInfo {
  name: string;
  type: string;
  length?: number;
  unsigned?: boolean;
  nullable: boolean;
  default: string | null;
  primary: boolean;
  autoIncrement: boolean;
}

export interface DbConnection {
  listTables(): Promise<string[]>;
  describeTable(table: string): Promise<ColumnInfo[]>;
  close(): Promise<void> | void;
}

export function createDbConnection(config: DbConfig): DbConnection {
  const adapter = config.adapter;
  if (adapter === "mysql") {
    const sql = new SQL(buildConnectionUrl(config, "mysql", 3306));
    return {
      async listTables() {
        const rows = (await sql`SHOW TABLES`) as Array<Record<string, string>>;
        return rows.map((r) => Object.values(r)[0]);
      },
      async describeTable(table: string) {
        const raw = (await sql`SHOW COLUMNS FROM ${sql(table)}`) as Array<{
          Field: string;
          Type: string;
          Null: string;
          Key: string;
          Default: string | null;
          Extra: string;
        }>;
        return raw.map((r) => ({
          name: r.Field,
          ...parseDbType(r.Type),
          nullable: r.Null === "YES",
          default: r.Default,
          primary: r.Key === "PRI",
          autoIncrement: r.Extra.includes("auto_increment"),
        }));
      },
      async close() {
        await sql.close();
      },
    };
  }

  if (adapter === "postgresql" || adapter === "postgres") {
    const sql = new SQL(buildConnectionUrl(config, "postgresql", 5432));
    return {
      async listTables() {
        const rows = (await sql`SELECT tablename FROM pg_tables WHERE schemaname = 'public'`) as Array<{
          tablename: string;
        }>;
        return rows.map((r) => r.tablename);
      },
      async describeTable(table: string) {
        const raw = (await sql`SELECT column_name, data_type, character_maximum_length, is_nullable, column_default FROM information_schema.columns WHERE table_name = ${table}`) as Array<{
          column_name: string;
          data_type: string;
          character_maximum_length: number | null;
          is_nullable: string;
          column_default: string | null;
        }>;
        return raw.map((r) => ({
          name: r.column_name,
          type: r.data_type,
          length: r.character_maximum_length ?? undefined,
          nullable: r.is_nullable === "YES",
          default: r.column_default,
          primary: false,
          autoIncrement: r.column_default?.includes("nextval") ?? false,
        }));
      },
      async close() {
        await sql.close();
      },
    };
  }

  if (adapter === "sqlite") {
    const db = new Database(config.path ?? ":memory:");
    return {
      async listTables() {
        const rows = db
          .query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_migrations'")
          .all() as Array<{ name: string }>;
        return rows.map((r) => r.name);
      },
      async describeTable(table: string) {
        const rows = db.query(`PRAGMA table_info(${escapeIdentifier(table)})`).all() as Array<{
          name: string;
          type: string;
          notnull: number;
          dflt_value: string | null;
          pk: number;
        }>;
        return rows.map((r) => {
          const parsed = parseDbType(r.type);
          return {
            name: r.name,
            ...parsed,
            nullable: r.notnull === 0,
            default: r.dflt_value,
            primary: r.pk === 1,
            autoIncrement: parsed.type === "integer" && r.pk === 1,
          };
        });
      },
      close() {
        db.close();
      },
    };
  }

  throw new Error(`Unsupported adapter: ${adapter}`);
}

function buildConnectionUrl(config: DbConfig, scheme: string, defaultPort: number): string {
  if (config.url) return config.url;
  const user = encodeURIComponent(config.user ?? "");
  const password = config.password ? encodeURIComponent(config.password) : "";
  const host = config.host ?? "localhost";
  const port = config.port ?? defaultPort;
  const database = config.database ?? "";
  const auth = password ? `${user}:${password}@` : user ? `${user}@` : "";
  return `${scheme}://${auth}${host}:${port}/${database}`;
}

function parseDbType(type: string): Pick<ColumnInfo, "type" | "length" | "unsigned"> {
  const lower = type.toLowerCase();
  const unsigned = lower.includes("unsigned");
  const clean = lower.replace("unsigned", "").trim();
  const match = clean.match(/^([a-z]+)(?:\(([^)]+)\))?/);
  const base = match?.[1] ?? clean;
  const args = match?.[2];
  let length: number | undefined;
  if (args) {
    const first = args.split(",")[0]?.trim();
    if (first && /^\d+$/.test(first)) {
      length = parseInt(first, 10);
    }
  }
  return { type: base, length, unsigned };
}

function escapeIdentifier(name: string): string {
  return `"${name.replace(/"/g, '""')}"`;
}
