"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editorFilePath = editorFilePath;
const path_1 = __importDefault(require("path"));
// Editor files are flat names, never client-supplied filesystem paths.
function editorFilePath(directory, name) {
    if (typeof name !== 'string' || !name || name === '.' || name === '..' ||
        /[<>:"/\\|?*\x00-\x1f]/.test(name) || /[. ]$/.test(name) ||
        /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name))
        throw new Error('Invalid file name');
    return path_1.default.join(directory, name);
}
