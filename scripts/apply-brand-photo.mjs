#!/usr/bin/env node
/**
 * Apply bw-brand-photo class to cover images missing brand filter.
 */
import fs from "fs";
import path from "path";

const ROOT = path.join(import.meta.dirname, "..", "src");

const SKIP_FILES = new Set([
  "ServiceImage.tsx",
  "VehicleOptionImage.tsx",
  "WaveGoLogo.tsx",
  "UserProfileNameCard.tsx",
  "FloatingChatWidget.tsx",
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.tsx$/.test(entry.name)) files.push(full);
  }
  return files;
}

let changed = 0;
for (const file of walk(ROOT)) {
  if (SKIP_FILES.has(path.basename(file))) continue;
  let text = fs.readFileSync(file, "utf8");
  if (!text.includes("<Image") || !text.includes("object-cover")) continue;
  if (text.includes("bw-brand-photo") || text.includes("BRAND_PHOTO_CLASS")) continue;

  let next = text;

  // Add import if BrandImageOverlay import exists but not BRAND_PHOTO_CLASS
  if (
    next.includes('from "@/components/brand/BrandImageOverlay"') &&
    !next.includes("BRAND_PHOTO_CLASS")
  ) {
    next = next.replace(
      'import { BrandImageOverlay } from "@/components/brand/BrandImageOverlay";',
      'import { BrandImageOverlay, BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";',
    );
  }

  // Replace common object-cover patterns on Image
  const replacements = [
    ['className="object-cover"', 'className={BRAND_PHOTO_CLASS}'],
    ['className="object-cover object-center"', 'className={BRAND_PHOTO_CLASS}'],
    [
      'className="object-cover transition-transform duration-500 group-hover:scale-105"',
      'className={cn(BRAND_PHOTO_CLASS, "transition-transform duration-500 group-hover:scale-105")}',
    ],
    [
      'className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"',
      'className={cn(BRAND_PHOTO_CLASS, "transition-transform duration-700 group-hover:scale-[1.03]")}',
    ],
    [
      'className="object-cover transition-transform duration-700 group-hover:scale-105"',
      'className={cn(BRAND_PHOTO_CLASS, "transition-transform duration-700 group-hover:scale-105")}',
    ],
    ['className="object-cover select-none"', 'className={cn(BRAND_PHOTO_CLASS, "select-none")}'],
  ];

  for (const [from, to] of replacements) {
    if (next.includes(from) && !next.includes("BRAND_PHOTO_CLASS")) {
      // Need cn import if using cn()
      if (to.includes("cn(") && !next.includes('from "@/lib/utils"')) {
        next = `import { cn } from "@/lib/utils";\n${next}`;
      }
      if (to.includes("BRAND_PHOTO_CLASS") && !next.includes("BRAND_PHOTO_CLASS")) {
        next = `import { BRAND_PHOTO_CLASS } from "@/components/brand/BrandImageOverlay";\n${next}`;
      }
      next = next.split(from).join(to);
    }
  }

  if (next !== text) {
    fs.writeFileSync(file, next);
    changed += 1;
    console.log(path.relative(ROOT, file));
  }
}
console.log(`\nUpdated ${changed} files`);
