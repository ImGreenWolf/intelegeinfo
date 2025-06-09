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
    runParams = '--device=/dev/video10:/dev/video0';
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
    xvfb x11vnc fluxbox python3-tk wget python3-opencv && apt-get clean
    RUN pip install opencv-python ultralytics 
    
CMD bash `;
    vcam;
    // -c "\
    //     Xvfb :1 -screen 0 1024x768x16 & \
    //     export DISPLAY=:1 && fluxbox & \
    //     python3 gui_app.py & \
    //     x11vnc -display :1 -rfbport 5900 -rfbunixpath /vnc/vnc.sock -forever -nopw -shared"`.trim()
    async onBuild(res, clientSession) {
        return new Promise((resolve) => {
            console.log('spawn gui');
            const proc = (0, child_process_1.spawn)('docker', ['exec', '-i', '-e', 'DISPLAY=:1', res.imageName, 'sh', '-c', `
      # Use the mounted vnc directory (relative to /app workdir)
      VNC_SOCK="vnc/vnc.sock"
      Xvfb :1 -screen 0 640x480x16 -ac +extension GLX +render -noreset &
      XVFB_PID=$!
      
      # Wait for Xvfb to be ready
      for i in \$(seq 1 10); do
        if xdpyinfo -display :1 >/dev/null 2>&1; then

          break
        fi
        sleep 1
      done

      x11vnc -display :1 -unixsock "\$VNC_SOCK" -nopw -forever -shared &
      X11VNC_PID=$! &
      echo $X11VNC_PID

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

      sleep 2
    `], {
                stdio: 'pipe'
            });
            let pid = 0;
            proc.on('close', err => {
                console.log('finally stopped');
                resolve(pid == 0 ? pid : proc.pid);
            });
            proc.stdout.on('data', (data) => {
                console.log("VNC SERVER: " + data.toString());
                if (data.includes('PORT')) {
                    fs.appendFileSync(path_1.default.resolve('/tmp/tokens.txt'), `${clientSession.sessionId}: unix_socket:/tmp/vnc-${clientSession.sessionId}/vnc.sock \ \n`);
                    setTimeout(() => {
                        // Start websockify
                        const wsProxy = (0, child_process_1.spawn)('websockify', [
                            '-D',
                            '--web', path_1.default.join(server_1.rootDirName, 'vnc', 'noVNC'),
                            '--token-plugin=TokenFile',
                            '--token-source=' + path_1.default.resolve('/tmp/tokens.txt'),
                            '--unix-target', `/tmp/vnc-${clientSession.sessionId}/vnc.sock`,
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
                            fs.accessSync(`/tmp/vnc-${clientSession.sessionId}/vnc.sock`);
                        }
                        catch (err) {
                            console.log("Cant acesss socket: " + err);
                        }
                    }, 3000);
                }
                else
                    pid = parseInt(data);
                (0, child_process_1.exec)('modprobe -r v4l2loopback');
                (0, child_process_1.exec)('modprobe v4l2loopback video_nr=10 card_label="virtualcam" exclusive_caps=1');
                this.vcam = (0, child_process_1.spawn)('python3', ['camera.py'], { stdio: 'pipe' });
                this.vcam.stdout.on('data', (data) => {
                    console.log('[this.vcam stdout]', data.toString());
                });
                this.vcam.stderr.on('data', (data) => {
                    console.error('[this.vcam stderr]', data.toString());
                });
                this.vcam.on('exit', (code) => {
                    console.log(`[this.vcam exit] Process exited with code ${code}`);
                });
            });
            setTimeout(() => {
                resolve(proc.pid || 0);
            }, 60000);
        });
    }
    receiveWebCam(rawData) {
        if (this.vcam)
            if (this.vcam.stdin.writable) {
                const data = Buffer.from(rawData, 'base64');
                const length = Buffer.alloc(4);
                length.writeUInt32BE(data.length, 0);
                this.vcam.stdin.write(length);
                this.vcam.stdin.write(data);
            }
    }
    async execute(res) {
        //  Xvfb :1 -screen 0 1024x768x16
        //   export DISPLAY=:1
        // execSync('docker exec -i '+res.imageName + ' sh -c "pip install opencv-python"')
        return (0, child_process_1.spawn)('docker', ['exec', "-i", '-e', 'DISPLAY=:1', res.imageName, "sh", "-c", "python clientFiles/" + res.fileName], {
            stdio: 'pipe', // pipe gives you access to stdin, stdout, stderr
        });
    }
    compile(res) {
        //  setTimeout(() => {
        //    return spawn('docker', ['exec', "-i", '-e', 'DISPLAY=:1', res.imageName, "sh","-c","pip install opencv-python"], {
        //        stdio: 'pipe',  // pipe gives you access to stdin, stdout, stderr
        //    });
        //  }, 500);
    }
    onSpawn(sessionObj) {
    }
}
exports.default = Python;
