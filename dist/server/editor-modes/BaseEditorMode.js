"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// maybe change from class to interface
class EditorMode {
    static name;
    static dockerFile;
    static dockerSafeTag;
    static extension;
    isExecutable = true;
    runParams(clientObj) {
        return '';
    }
    isInterpreter = false; // used for JIT languages like python or js
    checkCodeSyntax;
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
    sendError(err, fatal = false) {
        console.error(err);
    }
    constructor() {
    }
}
exports.default = EditorMode;
