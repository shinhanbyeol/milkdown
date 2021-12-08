/* Copyright 2021, Milkdown by Mirone. */
import typescript from '@rollup/plugin-typescript';
import path from 'path';
import { defineConfig } from 'vite';

const resolvePath = (str: string) => path.resolve(__dirname, str);

export default defineConfig({
    root: 'app',
    build: {
        sourcemap: true,
        lib: {
            entry: resolvePath('src/index.ts'),
            name: 'milkdown_plugin-tooltip',
            fileName: (format) => `index.${format}.js`,
        },
        rollupOptions: {
            external: [
                '@milkdown/core',
                '@milkdown/prose',
                '@milkdown/utils',
                '@milkdown/preset-gfm',
                '@milkdown/plugin-math',
            ],
            output: {
                dir: resolvePath('lib'),
                // Provide global variables to use in the UMD build
                // for externalized deps
                globals: {
                    '@milkdown/core': 'milkdown_core',
                    '@milkdown/prose': 'milkdown_prose',
                    '@milkdown/utils': 'milkdown_utils',
                },
            },
            plugins: [typescript()],
        },
    },
});