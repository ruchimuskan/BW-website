/**
 * Load a dotenv-style file into process.env, then run a command.
 * Usage: node scripts/with-env.mjs .env.staging next dev --turbopack -p 3000
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const envFile = process.argv[2];
const command = process.argv[3];
const args = process.argv.slice(4);

if (!envFile || !command) {
  console.error(
    "Usage: node scripts/with-env.mjs <env-file> <command> [...args]",
  );
  process.exit(1);
}

const envPath = resolve(process.cwd(), envFile);
const env = { ...process.env };

if (existsSync(envPath)) {
  for (const rawLine of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
} else {
  console.warn(`Env file not found: ${envPath} (continuing with process env)`);
}

const child = spawn(command, args, {
  env,
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 1);
});
