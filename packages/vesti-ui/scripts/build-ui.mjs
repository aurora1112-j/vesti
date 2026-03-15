import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(scriptDir, "..");
const distDir = path.resolve(packageDir, "dist");

rmSync(distDir, { recursive: true, force: true });

try {
  await build({
    absWorkingDir: packageDir,
    entryPoints: [path.resolve(packageDir, "src/index.ts")],
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2020",
    jsx: "automatic",
    tsconfig: path.resolve(packageDir, "tsconfig.build.json"),
    outfile: path.resolve(packageDir, "dist/index.js"),
    external: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "lucide-react",
      "marked",
      "dompurify",
      "echarts"
    ]
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
