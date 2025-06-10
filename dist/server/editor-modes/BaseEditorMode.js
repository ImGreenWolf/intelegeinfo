"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// maybe change from class to interface
class EditorMode {
    isExecutable = true;
    runParams;
    isInterpreter = false; // used for JIT languages like python or js
    shouldRebuild(sessionObj, clientObj) {
        return false;
    }
    onSpawn(sessionObj) {
        return;
    }
    onBuild(res, clientSession) {
        return 0;
    }
    startDebugging(res) {
        return;
    }
    constructor() {
    }
}
exports.default = EditorMode;
