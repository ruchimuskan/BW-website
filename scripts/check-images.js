const fs = require("fs");
const path = require("path");

const root = process.cwd();

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      walk(p, acc);
    } else if (/\.(ts|tsx|js|jsx)$/.test(e.name)) {
      acc.push(p);
    }
  }
  return acc;
}

const files = walk(path.join(root, "src"));
const re = /["'`](\/images\/[^"'`\s)]+)["'`]/g;
const refs = new Set();
for (const f of files) {
  const t = fs.readFileSync(f, "utf8");
  let m;
  while ((m = re.exec(t))) refs.add(m[1].split("?")[0]);
}

const missing = [];
for (const r of [...refs].sort()) {
  const fp = path.join(root, "public", r.replace(/^\//, ""));
  if (!fs.existsSync(fp)) missing.push(r);
}

console.log(JSON.stringify({ total: refs.size, missingCount: missing.length, missing }, null, 2));
if (missing.length > 0) {
  console.error("\nMissing image files break production. Add them under /public or fix references.");
  process.exit(1);
}
console.log("\nAll referenced /images assets are present.");
