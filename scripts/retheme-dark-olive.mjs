#!/usr/bin/env node
/**
 * Replace dark lime "second shade" palette with olive #38471b family.
 * Run: node scripts/retheme-dark-olive.mjs
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(import.meta.dirname, "..", "src");

const REPLACEMENTS = [
  // Darkest → darker olive
  ["#1A1F0A", "#283614"],
  ["#1a1f0a", "#283614"],
  // Main second shade (foreground / night)
  ["#2D3610", "#38471B"],
  ["#2d3610", "#38471b"],
  // Gradient mid-tone
  ["#3D4A18", "#4A5824"],
  ["#3d4a18", "#4a5824"],
  // rgba shadows & overlays
  ["rgba(26, 31, 10", "rgba(40, 54, 20"],
  ["rgba(26,31,10", "rgba(40,54,20"],
  ["rgba(45, 54, 16", "rgba(56, 71, 27"],
  ["rgba(45,54,16", "rgba(56,71,27"],
  ["rgba(20, 24, 8", "rgba(32, 42, 16"],
  ["rgba(20,24,8", "rgba(32,42,16"],
  // Dark mode surfaces (harmonized with #38471b)
  ["#0f1208", "#1a2210"],
  ["#161a0c", "#222b14"],
  ["#121608", "#1e2612"],
  ["#1a1f0f", "#283614"],
  ["#2a3318", "#38471b"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|css|mjs)$/.test(entry.name)) files.push(full);
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
    console.log(path.relative(ROOT, file));
  }
}
console.log(`\nUpdated ${changed} files`);
