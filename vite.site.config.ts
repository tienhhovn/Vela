import { defineConfig } from 'vite';
import { velaUiSource } from './scripts/vela-ui-source.mjs';
import { resolve } from 'path';

export default defineConfig({
    plugins: [velaUiSource()],
    root: 'playground',
    build: {
        outDir: '../site-dist',
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(__dirname, 'playground/index.html'),
        },
    },
});