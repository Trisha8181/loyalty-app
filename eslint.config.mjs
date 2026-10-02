import {createRequire} from "node:module";
import {FlatCompat} from "@eslint/eslintrc";
import {fileURLToPath} from "node:url";
import path from "node:path";
const require=createRequire(import.meta.url);
const compat=new FlatCompat({baseDirectory:path.dirname(fileURLToPath(import.meta.url)),resolvePluginsRelativeTo:path.dirname(require.resolve("eslint-config-next"))});
const config=[{ignores:[".next/**","node_modules/**",".vercel/**","next-env.d.ts"]},...compat.extends("next/core-web-vitals","next/typescript")];
export default config;


