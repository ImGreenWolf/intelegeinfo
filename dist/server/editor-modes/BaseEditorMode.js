"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// maybe change from class to interface
class EditorMode {
    isInterpreter = false; // used for JIT languages like python or js
    onSpawn() {
        return;
    }
    constructor() {
    }
}
exports.default = EditorMode;
