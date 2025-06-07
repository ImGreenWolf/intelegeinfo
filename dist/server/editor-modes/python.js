"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const BaseEditorMode_1 = __importDefault(require("./BaseEditorMode"));
const path_1 = __importDefault(require("path"));
const server_1 = require("../server");
const fs = __importStar(require("fs"));
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
    WORKDIR /app
RUN apt-get update && apt-get install -y \
    xvfb x11vnc fluxbox python3-tk wget && apt-get clean


CMD bash `;
    // -c "\
    //     Xvfb :1 -screen 0 1024x768x16 & \
    //     export DISPLAY=:1 && fluxbox & \
    //     python3 gui_app.py & \
    //     x11vnc -display :1 -rfbport 5900 -rfbunixpath /vnc/vnc.sock -forever -nopw -shared"`.trim()
    onBuild(res, clientSession) {
        const proc = (0, child_process_1.spawn)('docker', ['exec', '-i', '-e', 'DISPLAY=:1', res.imageName, 'sh', '-c', `
  # Use the mounted vnc directory (relative to /app workdir)
  VNC_SOCK="vnc/vnc.sock"

  Xvfb :1 -screen 0 1024x768x16 -ac +extension GLX +render -noreset &
  XVFB_PID=$!
  
  # Wait for Xvfb to be ready
  for i in \$(seq 1 10); do
    if xdpyinfo -display :1 >/dev/null 2>&1; then

      break
    fi
    sleep 1
  done

  x11vnc -display :1 -unixsock "\$VNC_SOCK" -nopw -forever -shared &
  X11VNC_PID=$!
  
  # Wait for socket creation

  for i in \$(seq 1 15); do
    if [ -S "\$VNC_SOCK" ]; then

      break
    fi
    sleep 1
    if [ \$i -eq 10 ] || [ \$i -eq 20 ]; then
      echo "[DEBUG] Still waiting... (attempt \$i/30)"
      ls -la vnc/ 2>/dev/null || echo "vnc directory not accessible"
    fi
  done
  

  
  #python clientFiles/${res.fileName} &
  #PYTHON_PID=$!
  sleep 60
`], {
            stdio: 'pipe'
        });
        proc.stdout.on('data', (data) => {
            console.log("skmskjsjkjsjkjjskjsh: " + data.toString());
            const port = data.toString().split('PORT=')[1];
            fs.appendFileSync(path_1.default.resolve('/tmp/tokens.txt'), `${clientSession.sessionId}: 127.0.0.1:${port}`);
        });
    }
    async execute(res) {
        //  Xvfb :1 -screen 0 1024x768x16
        //   export DISPLAY=:1
        return (0, child_process_1.spawn)('docker', ['exec', "-i", '-e', 'DISPLAY=:1', res.imageName, "sh", "-c", "python clientFiles/" + res.fileName], {
            stdio: 'pipe', // pipe gives you access to stdin, stdout, stderr
        });
    }
    compile() {
        return;
    }
    onSpawn(sessionObj) {
        setTimeout(() => {
            // Start websockify
            const wsProxy = (0, child_process_1.spawn)('websockify', [
                '--web', path_1.default.join(server_1.rootDirName, 'vnc', 'noVNC'),
                '--unix-target', `/tmp/vnc-${sessionObj.sessionId}/vnc.sock`,
                '    --token-plugin=TokenFile',
                '--token-source=', path_1.default.resolve('/tmp/tokens.txt'),
                '8080'
            ], { stdio: 'pipe' });
            wsProxy.stdout.on('data', (data) => {
                console.log('[ws stdout]', data.toString());
            });
            wsProxy.stderr.on('data', (data) => {
                console.error('[ws stderr]', data.toString());
            });
            wsProxy.on('exit', (code) => {
                console.log(`[ws exit] Process exited with code ${code}`);
            });
            try {
                fs.accessSync(`/tmp/vnc-${sessionObj.sessionId}/vnc.sock`);
            }
            catch (err) {
                console.log("Cant acesss socket: " + err);
            }
        }, 4000);
        // setTimeout(() => {
        //     console.log(fs.readFileSync(`/tmp/vnc-${sessionObj.sessionId}/vnc.sock`).toString())
        // }, 1000);
        // wsProxy.stdout.on('data', (data) => console.log(data.toString()));
    }
}
exports.default = Python;
