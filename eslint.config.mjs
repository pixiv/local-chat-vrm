import { defineConfig, globalIgnores } from "eslint/config";
import { fixupConfigRules } from "@eslint/compat";
import react from "eslint-plugin-react";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/dist"]), {
    extends: fixupConfigRules(compat.extends(
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:react-hooks/recommended",
        "prettier",
    )),

    plugins: {
        react,
    },

    languageOptions: {
        globals: {
            ...globals.browser,
        },

        parser: tsParser,
    },

    rules: {
        "react-refresh/only-export-components": ["off", {
            allowConstantExport: true,
        }],

        "no-constant-condition": ["error", {
            checkLoops: false,
        }],

        "@typescript-eslint/no-empty-interface": 0,
        "@typescript-eslint/no-empty-object-type": 0,
        "@typescript-eslint/no-explicit-any": 0,

        "@typescript-eslint/no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_",
        }],
    },
}]);