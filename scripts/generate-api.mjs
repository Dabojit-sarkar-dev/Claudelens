import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const openapiUrl = process.env.OPENAPI_URL || "http://localhost:8000/openapi.json";
const outFile = path.join(root, "frontend", "src", "types", "api.generated.ts");

fs.mkdirSync(path.dirname(outFile), { recursive: true });

console.log(`Fetching OpenAPI from ${openapiUrl}`);
execSync(`npx openapi-typescript "${openapiUrl}" -o "${outFile}"`, {
  stdio: "inherit",
  cwd: root,
});
console.log(`Wrote ${outFile}`);
