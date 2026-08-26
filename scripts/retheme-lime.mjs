import fs from "fs";
import path from "path";

const ROOT = path.join(import.meta.dirname, "..", "src");

const REPLACEMENTS = [
  ["#73398f", "#B8D926"],
  ["#73398F", "#B8D926"],
  ["#c45cf7", "#C8E84A"],
  ["#C45CF7", "#C8E84A"],
  ["#7346f4", "#9BB820"],
  ["#7346F4", "#9BB820"],
  ["#9b59c6", "#A8C820"],
  ["#9B59C6", "#A8C820"],
  ["#5f2d78", "#8FA618"],
  ["#5F2D78", "#8FA618"],
  ["#8b4aa8", "#9BB820"],
  ["#8B4AA8", "#9BB820"],
  ["#2a1240", "#1f2a0f"],
  ["#6b4a7a", "#5a6330"],
  ["#9b7aad", "#7a8448"],
  ["#5c3a6e", "#4a5228"],
  ["#eadff3", "#eef5d4"],
  ["#f3ebf8", "#f4f9e4"],
  ["#d4bce6", "#dce8a8"],
  ["#faf7ff", "#ffffff"],
  ["#fdfaff", "#fcfef8"],
  ["#f5f0ff", "#f7fbe8"],
  ["#ebe4f7", "#e8f0c8"],
  ["#dcc9ea", "#d4e8a0"],
  ["#a47eb6", "#7a8448"],
  ["#6e4a82", "#5a6330"],
  ["#d4b8e8", "#d4e8a8"],
  ["rgba(115, 57, 143,", "rgba(184, 217, 38,"],
  ["rgba(196, 92, 247,", "rgba(200, 232, 74,"],
  ["rgba(115, 70, 244,", "rgba(155, 184, 32,"],
  ["rgba(42, 18, 64,", "rgba(31, 42, 15,"],
  ["#14081f", "#141808"],
  ["#4a1f6e", "#3d4a18"],
  ["#f6effc", "#f4f9e4"],
  ["rgba(115,57,143", "rgba(184,217,38"],
  ["rgba(196,92,247", "rgba(200,232,74"],
  ["rgba(20,8,31", "rgba(20,24,8"],
  ["#9b5cf6", "#A8C820"],
  ["#5b3fd4", "#8FA618"],
  ["#3d2a8f", "#6B7A1A"],
  ["--brand-purple-dark", "--brand-lime-dark"],
  ["brand-purple", "brand-lime"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(tsx?|css|json)$/.test(entry.name)) files.push(full);
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
