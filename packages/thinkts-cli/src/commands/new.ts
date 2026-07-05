export function newProject(name: string): void {
  const fs = require("fs");
  const path = require("path");

  const root = path.resolve(name);
  if (fs.existsSync(root)) {
    console.error(`Directory ${name} already exists`);
    process.exit(1);
  }

  const tplDir = path.join(__dirname, "../../templates");
  const apiDir = path.join(root, "api");
  const adminDir = path.join(root, "admin");

  fs.mkdirSync(apiDir, { recursive: true });
  fs.mkdirSync(adminDir, { recursive: true });

  // ── Copy API template ───────────────────────────────────────────────
  copyDir(path.join(tplDir, "api"), apiDir);

  // Rename API package
  const apiPkgPath = path.join(apiDir, "package.json");
  if (!fs.existsSync(apiPkgPath)) {
    fs.writeFileSync(
      apiPkgPath,
      JSON.stringify({ name: `${name}-api`, version: "1.0.0", scripts: { dev: "bun development.ts", start: "bun bootstrap/worker.ts" }, dependencies: { thinkts: "latest", "reflect-metadata": "^0.2.2", valibot: "^1.4.1" } }, null, 2)
    );
  } else {
    const pkg = JSON.parse(fs.readFileSync(apiPkgPath, "utf-8"));
    pkg.name = `${name}-api`;
    if (pkg.dependencies?.thinkts === "file:../thinkts") {
      pkg.dependencies.thinkts = "latest";
    }
    fs.writeFileSync(apiPkgPath, JSON.stringify(pkg, null, 2));
  }

  // Rename API tsconfig include if needed
  const apiTsconfigPath = path.join(apiDir, "tsconfig.json");
  if (fs.existsSync(apiTsconfigPath)) {
    const ts = JSON.parse(fs.readFileSync(apiTsconfigPath, "utf-8"));
    ts.include = ["src/**/*", "config/**/*", "bootstrap/**/*"];
    fs.writeFileSync(apiTsconfigPath, JSON.stringify(ts, null, 2));
  }

  // ── Copy Admin template ─────────────────────────────────────────────
  copyDir(path.join(tplDir, "admin"), adminDir);
  // ── Copy schema template ────────────────────────────────────────────
  const schemaTpl = path.join(tplDir, "schema.sql");
  if (fs.existsSync(schemaTpl)) {
    fs.mkdirSync(path.join(root, "db"), { recursive: true });
    fs.copyFileSync(schemaTpl, path.join(root, "db", "schema.sql"));
  }

  // Rename admin package
  const adminPkgPath = path.join(adminDir, "package.json");
  if (fs.existsSync(adminPkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(adminPkgPath, "utf-8"));
    pkg.name = `${name}-admin`;
    fs.writeFileSync(adminPkgPath, JSON.stringify(pkg, null, 2));
  }

  // ── Root workspace package.json ──────────────────────────────────────
  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(
      {
        name,
        version: "1.0.0",
        private: true,
        workspaces: ["api", "admin"],
        scripts: {
          dev: "cd api && bun dev",
          "dev:admin": "cd admin && npm run dev",
          build: "cd admin && npm run build",
        },
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    path.join(root, ".gitignore"),
    `node_modules/\ndist/\n*.log\n.env.local\n`
  );

  fs.writeFileSync(
    path.join(root, "README.md"),
    `# ${name}\n\nThinkTS monorepo with API + Admin dashboard.\n\n## Quick Start\n\n\`\`\`bash\ncd ${name}\ncd api && bun install\ncd ../admin && npm install\n\n# Terminal 1: start API\ncd api && bun dev\n\n# Terminal 2: start Admin\ncd admin && npm run dev\n\`\`\`\n`
  );

  console.log(`Created project: ${name}`);
  console.log(`  api/   → ThinkTS backend (port 3333)`);
  console.log(`  admin/ → React admin dashboard (port 3334)`);
  console.log(`Run: cd ${name} && follow README.md`);
}

function copyDir(src: string, dest: string): void {
  const fs = require("fs");
  const path = require("path");
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
