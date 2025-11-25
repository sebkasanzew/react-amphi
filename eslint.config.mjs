import js from "@eslint/js";
import playwright from "eslint-plugin-playwright";

export default [
    js.configs.recommended,
    {
        ignores: ["**/dist/**", "**/.next/**", "**/node_modules/**"],
    },
    {
        files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "warn",
        },
    },
    {
        ...playwright.configs["flat/recommended"],
        files: ["**/tests/**/*.spec.ts", "**/tests/**/*.test.ts"],
    },
];
