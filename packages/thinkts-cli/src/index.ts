#!/usr/bin/env bun
import { newProject } from "./commands/new";
import { generateFromDB } from "./commands/generate";
import { generateManifestCommand } from "./commands/manifest";

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "new":
    newProject(args[1] ?? "thinkts-app");
    break;
  case "generate":
  case "g":
    generateFromDB(process.cwd(), args.includes("--js"));
    break;
  case "manifest":
    generateManifestCommand(process.cwd());
    break;
  default:
    console.log(`Usage:
  thinkts new <project-name>     Create a new ThinkTS project
  thinkts generate               Generate controllers/services from database tables
  thinkts g                      Alias for generate
  thinkts manifest               Generate manifest.json for fast startup
`);
    process.exit(1);
}
