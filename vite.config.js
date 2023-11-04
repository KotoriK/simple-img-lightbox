import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { resolve } from 'node:path'
import pkg from './package.json'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({ rollupTypes: true }), solidPlugin(),],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext', minify: false,
    reportCompressedSize: false,
    sourcemap: true,
    rollupOptions: {
      external: Object.keys(pkg.dependencies).map(moduleName => new RegExp('^' + moduleName))
    },
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      // the proper extensions will be added
      fileName: 'index'
    }
  },
});
