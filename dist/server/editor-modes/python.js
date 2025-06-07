"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const BaseEditorMode_1 = __importDefault(require("./BaseEditorMode"));
const path_1 = __importDefault(require("path"));
const server_1 = require("../server");
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
    `FROM python:3.10

RUN apt-get update && apt-get install -y \
    xvfb x11vnc fluxbox python3-tk wget && apt-get clean


CMD bash `;
    // -c "\
    //     Xvfb :1 -screen 0 1024x768x16 & \
    //     export DISPLAY=:1 && fluxbox & \
    //     python3 gui_app.py & \
    //     x11vnc -display :1 -rfbport 5900 -rfbunixpath /vnc/vnc.sock -forever -nopw -shared"`.trim()
    async execute(res) {
        //  Xvfb :1 -screen 0 1024x768x16
        //   export DISPLAY=:1
        return (0, child_process_1.spawn)('docker', ['exec', "-i", res.imageName, "bash", "-c", "Xvfb :1 -screen 0 1024x768x16 && sleep 1 && export DISPLAY=:1 && python clientFiles/" + res.fileName + " x11vnc -display :1 -rfbunixpath /vnc/vnc.sock -forever -nopw -shared"], {
            stdio: 'pipe', // pipe gives you access to stdin, stdout, stderr
            env: { DISPLAY: ':1' }
        });
    }
    compile() {
        return;
    }
    onSpawn(sessionObj) {
        // Start websockify
        const wsProxy = (0, child_process_1.spawn)('websockify', [
            '--web', path_1.default.join(server_1.rootDirName, 'vnc', 'noVNC'),
            '--unix-target', `/tmp/vnc-${sessionObj.sessionId}/vnc.sock`, '8080'
        ]);
        console.log(`/tmp/vnc-${sessionObj.sessionId}/vnc.sock`);
        wsProxy.stdout.on('data', (data) => console.log(data.toString()));
    }
}
exports.default = Python;
