/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["../../packages/eslint-config/next.js"],
  rules: {
    "react/react-in-jsx-scope": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "unused-imports/no-unused-imports": "error",
    "react-hooks/exhaustive-deps": "off",
    "import/no-unresolved": "error",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  plugins: ["import"],
};
