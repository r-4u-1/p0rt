import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { siteContent } from './config/siteContentPlugin';

/**
 * `base` must match the GitHub Pages sub-path (https://<user>.github.io/<repo>/).
 * The deploy workflow sets VITE_BASE automatically from the repository name,
 * so local dev and CI stay in sync without editing this file.
 *
 * `siteContent()` decides where the words come from: an injected
 * SITE_CONTENT secret, a local file, or the placeholders in src/content/.
 */
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), siteContent()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  css: {
    modules: {
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: { react: ['react', 'react-dom'] },
      },
    },
  },
});
