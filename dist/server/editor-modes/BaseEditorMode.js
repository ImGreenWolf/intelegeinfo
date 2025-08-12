"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// maybe change from class to interface
class EditorMode {
    static name;
    static logoSrc;
    static description;
    static color;
    static versions;
    static dockerFile;
    static dockerSafeTag;
    static extension;
    static defaultText;
    static clientCompile = false;
    static isExecutable = true;
    runParams(clientObj) {
        return '';
    }
    static isInterpreter = false; // used for JIT languages like python or js
    checkCodeSyntax;
    shouldRebuild(sessionObj, clientObj) {
        return false;
    }
    onSpawn(sessionObj) {
        return;
    }
    onBuild(res, clientSession, clientObj) {
        return 0;
    }
    startDebugging(res, clientObj, sessionObj) {
        return;
    }
    sendError(err, fatal = false) {
        console.error(err);
    }
    constructor() {
    }
}
exports.default = EditorMode;
