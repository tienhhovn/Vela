import { defineConfig } from 'vitest/config';
import { velaUiSource } from './scripts/vela-ui-source.mjs';
import { resolve } from 'path';

export default defineConfig({
    plugins: [velaUiSource()],
    root: 'playground', // Đặt thư mục gốc build là playground để nhận thẳng file HTML ở đây
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: resolve(__dirname, 'playground/workspace.html'),
        },
    },
    test: {
        include: ['src/**/*.test.ts', 'test/**/*.test.ts', 'test/**/*.test.mjs'],
        environment: 'node',
    },
});