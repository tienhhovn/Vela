import { defineConfig } from 'vitest/config';
import { velaUiSource } from './scripts/vela-ui-source.mjs';
import { resolve } from 'path';

export default defineConfig({
    plugins: [velaUiSource()],
    build: {
        rollupOptions: {
            input: resolve(__dirname, 'index.html'),
        },
    },
    test: {
        include: ['src/**/*.test.ts', 'test/**/*.test.ts', 'test/**/*.test.mjs'],
        environment: 'node',
    },
});