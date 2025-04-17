"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const path_1 = __importDefault(require("path"));
exports.default = (0, vite_1.defineConfig)({
    build: {
        rollupOptions: {
            input: path_1.default.resolve(__dirname, 'public/js/codeEditor.ts'), // set the main file (entry point)
            output: {
                // Bundle all JS into a single file
                entryFileNames: 'js/bundle.js',
            },
            // Make sure all files from the public/js folder are included in the bundle
            // By using 'include' in the `input` array (you can list other TS files too)
            external: [], // Specify external libraries if you have any, like 'lodash'
        },
        outDir: 'dist', // Output to the dist folder
        emptyOutDir: true, // Clear dist folder on each build
    },
    publicDir: 'public', // Keep your public files in the dist folder after build
});
