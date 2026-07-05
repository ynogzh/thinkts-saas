import { readdirSync, statSync, existsSync, writeFileSync } from "fs";
import { join } from "node:path";

function resolvePathWithExt(basePath: string): string | null {
  for (const ext of [".ts", ".js"]) {
    const p = basePath + ext;
    if (existsSync(p)) return p;
  }
  return null;
}

function scanFeature(srcPath: string, fileName: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!existsSync(srcPath)) return result;

  function scan(dir: string, prefix: string) {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const entryPath = join(dir, entry);
      const stat = statSync(entryPath);
      if (!stat.isDirectory()) continue;

      const resolved = resolvePathWithExt(join(entryPath, fileName));
      const modulePath = prefix ? `${prefix}/${entry}` : entry;

      if (resolved) {
        result[modulePath] = resolved;
      }
      scan(entryPath, modulePath);
    }
  }
  scan(srcPath, "");
  return result;
}

export function generateManifestCommand(cwd: string): void {
  const srcPath = join(cwd, "src");
  const outPath = join(cwd, "manifest.json");

  const manifest = {
    controllers: scanFeature(srcPath, "controller"),
    logics: scanFeature(srcPath, "logic"),
    services: scanFeature(srcPath, "service"),
    models: scanFeature(srcPath, "model"),
  };

  writeFileSync(outPath, JSON.stringify(manifest, null, 2));

  const total = Object.values(manifest).reduce((sum: number, map) => sum + Object.keys(map).length, 0);
  console.log(`Manifest written to ${outPath}`);
  console.log(`  Controllers: ${Object.keys(manifest.controllers).length}`);
  console.log(`  Services:    ${Object.keys(manifest.services).length}`);
  console.log(`  Logics:      ${Object.keys(manifest.logics).length}`);
  console.log(`  Models:      ${Object.keys(manifest.models).length}`);
  console.log(`  Total:       ${total}`);
}
