import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: 'src/index.ts',
  format: ['esm', 'cjs', 'iife'],
  outDir: 'dist',
  dts: false,
  clean: true,
  sourcemap: true,
  minify: false,
  external: ['clsx', 'date-fns', 'dayjs', 'tailwind-merge'],
});
