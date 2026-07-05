# ThinkTS CLI — Project Scaffolding & DSL Codegen

## Quick context
CLI tool for ThinkTS framework. See workspace-level `CLAUDE.md` for full context.
Commands: `new` (scaffold), `generate` (DB→DSL), `manifest` (precompile routes).
Templates live in `templates/` — these are user-facing, must be pristine.

## Commands
```bash
bun test                          # 5 tests must pass
bun src/index.ts new test-app     # verify scaffold works
```
