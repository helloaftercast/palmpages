import { readFileSync } from "node:fs";
import { publicAvailability } from "../functions/_lib/busy-from-ical.js";

var file = process.argv[2];
var shop = process.argv[3] || "";
if (!file) {
  console.error("Usage: node tools/ical-to-busy.mjs <file.ics> [shop-slug]");
  process.exit(1);
}

var ics = readFileSync(file, "utf8");
process.stdout.write(JSON.stringify(publicAvailability(ics, { shop: shop }), null, 2) + "\n");
