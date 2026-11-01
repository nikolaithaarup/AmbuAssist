import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import {
  BYEN_CATEGORIES,
  BYEN_MAP,
  BYEN_STREET_ALIASES,
  STREET_SAMPLE,
} from "../src/features/destination/data/byen";
import { REGION_BYEN_MAP } from "../src/features/destination/data/regionByen";
import { REGION_MIDT_CATEGORIES, REGION_MIDT_MAP } from "../src/features/destination/data/regionMidt";
import { REGION_NORD_MAP } from "../src/features/destination/data/regionNord";
import { REGION_SYD_MAP } from "../src/features/destination/data/regionSyd";

const output = process.argv[2];
if (!output) {
  throw new Error("Usage: tsx scripts/exportVisitationAdminBootstrap.ts <output.json>");
}

const regionMap = {
  ...REGION_NORD_MAP,
  ...REGION_MIDT_MAP,
  ...REGION_SYD_MAP,
  ...REGION_BYEN_MAP,
};

const snapshot = {
  version: "ambuassist-reviewed-baseline-v1",
  byen: {
    categories: BYEN_CATEGORIES,
    map: BYEN_MAP,
    streetSample: STREET_SAMPLE,
    aliases: BYEN_STREET_ALIASES,
  },
  region: {
    categories: REGION_MIDT_CATEGORIES,
    map: regionMap,
  },
};

async function main() {
  await writeFile(resolve(output!), `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
  console.log(`Exported ${STREET_SAMPLE.length} street rules to ${resolve(output!)}`);
}

void main();
