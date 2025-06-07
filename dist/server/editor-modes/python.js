"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const BaseEditorMode_1 = __importDefault(require("./BaseEditorMode"));
class Python extends BaseEditorMode_1.default {
    name = 'Python';
    extension = ['py'];
    isInterpreter = true;
    dockerFile = `
    # install from python image
    FROM python:3

    # Set working directory inside container
    WORKDIR /app
    # Default command can be overridden
    CMD [ "bash" ]`.trim();
    execute(res) {
        return (0, child_process_1.spawn)('docker', ['exec', "-i", res.imageName, "bash", "-c", "python " + res.fileName], {
            stdio: 'pipe' // pipe gives you access to stdin, stdout, stderr
        });
    }
    compile() {
        return;
    }
}
exports.default = Python;
