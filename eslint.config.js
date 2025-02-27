import eslintPluginAstro from 'eslint-plugin-astro';
import sort from "eslint-plugin-sort"
import unusedImports from "eslint-plugin-unused-imports";

export default [
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  sort.configs["flat/recommended"],
  {
      plugins: {
          "unused-imports": unusedImports,
      },
      rules: {
          "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
          "unused-imports/no-unused-imports": "error",
          "unused-imports/no-unused-vars": [
              "warn",
              {
                  "args": "after-used",
                  "argsIgnorePattern": "^_",
                  "vars": "all",
                  "varsIgnorePattern": "^_",
              },
          ]
      }
  }
];