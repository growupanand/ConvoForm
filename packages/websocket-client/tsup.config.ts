import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Your entry file
  format: ["cjs", "esm"], // CommonJS format
  outDir: "dist",
  splitting: false, // Disable code splitting
  sourcemap: true, // Enable source maps for debugging
  clean: true, // Clean the output directory before building
  noExternal: ["socket.io-client"],
  dts: true, // Generate .d.ts files
  // minify: true,
  treeshake: true,
});
