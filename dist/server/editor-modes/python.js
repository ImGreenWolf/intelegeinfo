"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const BaseEditorMode_1 = __importDefault(require("./BaseEditorMode"));
class Python extends BaseEditorMode_1.default {
    name = 'Python';
    dockerSafeTag = 'py';
    extension = ['py'];
    isInterpreter = true;
    dockerFile = 
    // `
    // # install from python image
    // FROM python:3
    // # Set working directory inside container
    // WORKDIR /app
    // # Default command can be overridden
    // CMD [ "bash" ]`.trim();
    `FROM python:3.10-slim

RUN apt-get update && apt-get install -y \
    xvfb x11vnc fluxbox python3-tk wget && apt-get clean


CMD bash -c "\
    Xvfb :1 -screen 0 1024x768x16 & \
    export DISPLAY=:1 && fluxbox & \
    python3 gui_app.py & \
    x11vnc -display :1 -rfbport 5900 -rfbunixpath /vnc/vnc.sock -forever -nopw -shared"`.trim();
    async execute(res) {
        //  Xvfb :1 -screen 0 1024x768x16
        //   export DISPLAY=:1
        return (0, child_process_1.spawn)('docker', ['exec', "-i", res.imageName, "bash", "-c", "Xvfb :1 -screen 0 1024x768x16 && python clientFiles/" + res.fileName], {
            stdio: 'pipe', // pipe gives you access to stdin, stdout, stderr
            env: { DISPLAY: ':1' }
        });
    }
    compile() {
        return;
    }
    onSpawn() {
        // Start websockify
        const wsProxy = (0, child_process_1.spawn)('websockify', [
            '--unix-target', '/tmp/vnc/vnc.sock', '6081'
        ]);
        wsProxy.stdout.on('data', (data) => console.log(data.toString()));
    }
}
exports.default = Python;
