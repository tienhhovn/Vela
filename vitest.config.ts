import { defineConfig } from 'vitest/config';
import { velaUiSource } from './scripts/vela-ui-source.mjs';
import { resolve } from 'path';

export default defineConfig({
    plugins: [velaUiSource()],
    // Cấu hình build để Vercel nhận diện đúng trang workspace làm điểm xuất phát
    build: {
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'playground/workspace.html'),
            },
        },
    },
    test: {
        // `.mjs` tests cover the framework-free playground modules (plain JS, outside the
        // TS build) — e.g. the keyboard-shortcut policy in `playground/modules/shortcuts-core.js`.
        include: ['src/**/*.test.ts', 'test/**/*.test.ts', 'test/**/*.test.mjs'],
        environment: 'node',
    },
});