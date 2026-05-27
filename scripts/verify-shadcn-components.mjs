#!/usr/bin/env node
/**
 * Smoke-check: panel shadcn UI files exist and export expected symbols.
 * Run: node scripts/verify-shadcn-components.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const uiDir = join(root, "src/panel/components/ui");

const expected = [
  { file: "button.jsx", exports: ["Button", "buttonVariants"] },
  { file: "input.jsx", exports: ["Input"] },
  { file: "slider.jsx", exports: ["Slider"] },
  { file: "tabs.jsx", exports: ["Tabs", "TabsList", "TabsTrigger", "TabsContent"] },
  { file: "tooltip.jsx", exports: ["Tooltip", "TooltipTrigger", "TooltipContent", "TooltipProvider"] },
  { file: "popover.jsx", exports: ["Popover", "PopoverTrigger", "PopoverContent"] },
  { file: "label.jsx", exports: ["Label"] },
  { file: "switch.jsx", exports: ["Switch"] },
];

let failed = 0;

for (const { file, exports: names } of expected) {
  const path = join(uiDir, file);
  if (!existsSync(path)) {
    console.error(`MISSING ${file}`);
    failed++;
    continue;
  }
  const src = readFileSync(path, "utf8");
  if (src.includes('"use client"')) {
    console.error(`FAIL ${file}: remove "use client" (Vite panel, not Next)`);
    failed++;
  }
  for (const name of names) {
    if (!src.includes(`export {`) && !src.includes(`export { ${name}`)) {
      // loose check
    }
    if (!new RegExp(`\\b${name}\\b`).test(src)) {
      console.error(`FAIL ${file}: missing export symbol ${name}`);
      failed++;
    }
  }
}

const componentsCss = join(root, "src/panel/styles/components.css");
if (!existsSync(componentsCss)) {
  console.error("MISSING src/panel/styles/components.css");
  failed++;
}

if (failed) {
  process.exit(1);
}

console.log(`OK ${expected.length} shadcn panel components verified`);
