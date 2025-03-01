import eslintPluginAstro from 'eslint-plugin-astro';
import sort from "eslint-plugin-sort"
import unusedImports from "eslint-plugin-unused-imports";
import tseslint from 'typescript-eslint';

export default tseslint.config([
    tseslint.configs.recommended,
{
    ignores: ["dist/*", ".astro/*"]
},
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  sort.configs["flat/recommended"],
  {
      plugins: {
          "unused-imports": unusedImports,
      },
      rules: {
          "@typescript-eslint/no-unused-vars": [
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
]);