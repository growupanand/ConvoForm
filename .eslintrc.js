// This configuration only applies to the package manager root.
/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["./apps/web/.eslintrc.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    tsconfigRootDir: __dirname,
    project: ["./apps/*/tsconfig.json", "./packages/**/*/tsconfig.json"],
  },
};
