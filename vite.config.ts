import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build`        → normal production build (dist/)
// `npm run build:single` → JS + CSS inlined into one index.html (dist-single/),
//                          assets/ klasörü yanında kalır. Önizleme ve basit barındırma için.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  build: {
    // Eski iPhone'lar (iOS 12+) da açabilsin: yeni sözdizimi derlemede eski
    // karşılığına çevrilir. Varsayılan hedef Safari 14 idi.
    target: ['es2017', 'safari12', 'ios12'],
    cssTarget: ['safari12', 'ios12'],
    outDir: mode === 'single' ? 'dist-single' : 'dist',
    assetsInlineLimit: 0,
  },
}));
