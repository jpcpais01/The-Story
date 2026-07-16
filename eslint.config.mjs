import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // React Compiler's purity/immutability lint rules assume components never
    // imperatively mutate long-lived objects. That's exactly how react-three-fiber
    // is meant to be used (materials/geometries mutated in place across renders
    // for GPU performance) -- these rules don't apply here, and we don't enable
    // the actual React Compiler transform (`reactCompiler` is unset in next.config.ts).
    files: ["components/map/**/*.{ts,tsx}"],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
    },
  },
]);

export default eslintConfig;
