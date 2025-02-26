import eslintPluginAstro from 'eslint-plugin-astro';
import sort from "eslint-plugin-sort"

export default [
  // add more generic rule sets here, such as:
  // js.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  sort.configs["flat/recommended"],
  {
    rules: {
      
      // override/add rules settings here, such as:
      // "astro/no-set-html-directive": "error"
    }
  }
];