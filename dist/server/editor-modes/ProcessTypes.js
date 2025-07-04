"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DebugProcess {
    killed = false;
    pid = Math.floor(Math.random() * 1000);
    constructor() {
    }
}
exports.default = DebugProcess;
