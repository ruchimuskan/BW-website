#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = path.join(import.meta.dirname, "..", "src");

const REPLACEMENTS = [
  ["#141808", "#1A1F0A"],
  ["#141808", "#1A1F0A"],
  ["#1f2a0f", "#2D3610"],
  ["#1F2A0F", "#2D3610"],
  ["#1a0a2e", "#1A1F0A"],
  ["#3d1a5c", "#3D4A18"],
  ["#4a1f6e", "#4A5810"],
  ["#e4b4ff", "#D4E88A"],
  ["#e9c8ff", "#D4E88A"],
  ["#f3e8ff", "#eef5d4"],
  ["#f3e9ff", "#eef5d4"],
  ["#f8f3fb", "#f7fbe8"],
  ["#f6f2f9", "#f7fbe8"],
  ["#faf7fc", "#fcfef8"],
  ["#f7f3fb", "#f4f9e4"],
  ["rgba(42, 18, 64", "rgba(26, 31, 10"],
  ["rgba(42,18,64", "rgba(26,31,10"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|css)$/.test(entry.name)) files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(ROOT)) {
  let text = fs.readFileSync(file, "utf8");
  let next = text;
  for (const [from, to] of REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  if (next !== text) {
    fs.writeFileSync(file, next);
    changed += 1;
  }
}
console.log(`Updated ${changed} files`);
