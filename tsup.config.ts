import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  // ESM code does not need to be minified.
  // This is the role of the consumer.
  minify: false,
  splitting: false,
  // Generate sourcemap files.
  sourcemap: true,
  // Generate declaration file.
  dts: true,
  // Clean output directory before each build.
  clean: true
});
