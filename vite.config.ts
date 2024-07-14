import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      entryRoot: 'src',
      outDir: 'dist/typings',
      insertTypesEntry: true,
      rollupTypes: true,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    open: true,
  },
  build: {
    outDir:'dist',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'peintre',
      fileName: format => `peintre.${format}.js`,
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['vue', 'vuedraggable'],
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
          vuedraggable: 'draggable'
        },
        dir:'dist'
      },
    },
  },
  // base: '/Peintre2/',
})
